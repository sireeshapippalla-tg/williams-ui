import React, { useState } from "react";
import { MessageCircle, Send, FileText, X, History, Trash2 } from "lucide-react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import Tooltip from '@mui/material/Tooltip';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const SearchResults = ({ results, onViewDocument }) => {
  if (!results || !results.top_results || results.top_results.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500 text-sm">
        No matching documents found
      </div>
    );
  }
  const truncateContent = (content, maxLength = 100) => {
    return content.length > maxLength
      ? content.slice(0, maxLength) + '...'
      : content;
  };

  return (
    <div className="space-y-4">
      {results.top_results.map((result, index) => (
        <div
          key={index}
          className="p-3 border rounded-lg bg-white hover:bg-gray-50 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <h3 className="font-medium text-base">{result.fileName}</h3>
          </div>
          {result.content && (
            <div className="text-gray-600 text-sm mb-2">
              <div className="bg-gray-50 p-2 rounded border max-h-32 overflow-auto">
              <p>{truncateContent(result.content)}</p>
              </div>
            </div>
          )}
          <Button
            size="small"
            variant="outlined"
            onClick={() => onViewDocument(result.fileName)}
          >
            View
          </Button>
        </div>
      ))}
    </div>
  );
};

const SearchHistoryModal = ({
  isOpen,
  onClose,
  history,
  onRerunSearch,
  onClearHistory,
  onRemoveItem,
}) => (
  <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>
      Recent Searches
      <IconButton
        aria-label="close"
        onClick={onClose}
        style={{ position: "absolute", right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent dividers>
      {history.length === 0 ? (
        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          className="py-8 text-sm"
        >
          No search history yet
        </Typography>
      ) : (
        <div className="space-y-4">
          {history.slice().reverse().map((item, index) => (
            <div key={index} className="border rounded-lg p-2">
              <div className="flex justify-between items-start mb-1">
                <Button
                  onClick={() => {
                    onRerunSearch(item.query);
                    onClose();
                  }}
                  color="primary"
                  size="small"
                  className="font-medium"
                >
                  "{item.query}"
                </Button>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {new Date(item.timestamp).toLocaleTimeString()}
                  <IconButton
                    onClick={() => onRemoveItem(index)}
                    className="p-1 text-gray-400 hover:text-red-500"
                    size="small"
                  >
                    <X className="w-4 h-4" />
                  </IconButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DialogContent>
    <DialogActions>
      <Button size="small" onClick={onClearHistory} color="secondary">
        Clear All
      </Button>
      <Button size="small" onClick={onClose} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

const AISearchDashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content:
        "Hi! I can help you search through your documents. What would you like to find?",
    },
  ]);

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);

  const openDocumentViewer = (fileName) => {
    setCurrentDocument(`/documents/${fileName}`);
    setIsViewerOpen(true);
  };

  const closeDocumentViewer = () => {
    setIsViewerOpen(false);
    setCurrentDocument(null);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    setIsHistoryModalOpen(false);
  };

  const removeHistoryItem = (index) => {
    setSearchHistory((prev) => prev.filter((_, i) => i !== index));
  };

  const rerunSearch = (query) => {
    setPrompt(query);
    handleSubmit(query);
  };

  const handleSubmit = async (searchQuery = prompt) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { type: "user", content: searchQuery }]);

    try {
      const response = await fetch(
        `http://localhost:8084/iassure/api/incident/search?query=${encodeURIComponent(
          searchQuery
        )}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      console.log(data);

      if (data && data.top_results) {
        setSearchResults(data);
      } else {
        setSearchResults(null);
      }

      setSearchHistory((prev) => [
        ...prev,
        { query: searchQuery, results: data, timestamp: new Date().toISOString() },
      ]);

      const resultCount = data?.top_results?.length || 0;
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content:
            resultCount > 0
              ? `I found ${resultCount} document${
                  resultCount === 1 ? "" : "s"
                } that might be relevant to your query.`
              : "I couldn't find any documents matching your query. Try rephrasing your search.",
        },
      ]);
    } catch (error) {
      console.error("Error searching documents:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content:
            "Sorry, I encountered an error while searching. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setPrompt("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="container-fluid py-3"
      style={{ overflowY: "auto", minHeight: "100vh", backgroundColor: "#f8f9fa" }}
    >
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h5 font-weight-bold">AI Document Search</h1>
          <div className="d-flex gap-2">
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
            >
              <History size={18} />
              <span>{searchHistory.length} Recent Searches</span>
            </button>
          </div>
        </div>

        <div className="row" style={{ height: "calc(100vh - 140px)", overflowY: "auto" }}>
          <div className="col-lg-6 mb-4">
            <div className="card h-100">
              <div className="card-header d-flex align-items-center gap-2">
                <MessageCircle className="text-primary" size={20} />
                <h2 className="h6 font-weight-semibold mb-0">AI Assistant</h2>
              </div>
              <div className="card-body overflow-auto" style={{ fontSize: "0.9rem" }}>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`d-flex ${
                      message.type === "user" ? "justify-content-end" : "justify-content-start"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg mb-2 ${
                        message.type === "user"
                          ? "bg-primary text-white"
                          : "bg-light text-dark"
                      }`}
                      style={{ maxWidth: "80%" }}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="card-footer">
                <div className="input-group">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="What would you like to find in your documents?"
                    className="form-control"
                  />
                  <div className="input-group-append">
                    <button
                      onClick={() => handleSubmit()}
                      disabled={isLoading}
                      className="btn btn-primary m-auto"
                      style={{ padding: "10px 14px" }}
                    >
                      {isLoading ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 mb-4">
            <div className="card h-100">
              <div className="card-header d-flex align-items-center gap-2">
                <FileText className="text-secondary" size={20} />
                <span className="font-weight-medium">Search Results</span>
              </div>
              <div className="card-body overflow-auto">
                {searchResults ? (
                  <SearchResults results={searchResults} onViewDocument={openDocumentViewer} />
                ) : (
                  <div className="text-center text-secondary text-sm">
                    Your search results will appear here
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <SearchHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          history={searchHistory}
          onRerunSearch={rerunSearch}
          onClearHistory={clearHistory}
          onRemoveItem={removeHistoryItem}
        />
      </div>

      <Dialog open={isViewerOpen} onClose={closeDocumentViewer} fullWidth maxWidth="md">
        <DialogTitle>
          Document Viewer
          <IconButton
            aria-label="close"
            onClick={closeDocumentViewer}
            style={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {currentDocument ? (
            <iframe
              src={currentDocument}
              title="Document Viewer"
              width="100%"
              height="600px"
              style={{ border: "none" }}
            />
          ) : (
            <Typography variant="body2" color="textSecondary">
              Document not found.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDocumentViewer} size="small" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AISearchDashboard;
