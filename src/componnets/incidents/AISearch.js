import React, { useState } from 'react';
import { MessageCircle, Send, FileText, X, History, Trash2 } from 'lucide-react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { DialogContentText } from '@mui/material';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const SearchResults = ({ results }) => {
  if (!results || (Array.isArray(results) && results.length === 0)) {
    return (
      <div className="text-center p-4 text-gray-500">
        No matching documents found
      </div>
    );
  }

  const parsedResults = Array.isArray(results) ? results : [results];

  return (
    <div className="space-y-4">
      {parsedResults.map((result, index) => (
        <div key={index} className="p-4 border rounded-lg bg-white hover:bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium text-lg">{result.fileName}</h3>
          </div>
          {result.content && (
            <div className="text-gray-600">
              <div className="bg-gray-50 p-3 rounded border">
                <p>{result.content}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const SearchHistoryModal = ({ isOpen, onClose, history, onRerunSearch, onClearHistory, onRemoveItem }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            <h2 className="text-xl font-semibold">Recent Searches</h2>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No search history yet
            </div>
          ) : (
            <div className="space-y-4">
              {history.slice().reverse().map((item, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <button
                      onClick={() => {
                        onRerunSearch(item.query);
                        onClose();
                      }}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      "{item.query}"
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="pl-4 border-l-2 border-gray-200">
                    <SearchResults results={item.results} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



const AISearchDashboard = ({ onClose, history, onRerunSearch, onClearHistory, onRemoveItem }) => {
  const [prompt, setPrompt] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', content: "Hi! I can help you search through your documents. What would you like to find?" },
  ]);

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };


  const clearHistory = () => {
    setSearchHistory([]);
    setIsHistoryModalOpen(false);
  };

  const removeHistoryItem = (index) => {
    setSearchHistory(prev => prev.filter((_, i) => i !== index));
  };

  const rerunSearch = (query) => {
    setPrompt(query);
    handleSubmit(query);
  };

  const handleSubmit = async (searchQuery = prompt) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { type: 'user', content: searchQuery }]);

    try {
      const response = await fetch(`http://localhost:8084/iassure/api/incident/search?query=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      setSearchResults(data);

      setSearchHistory(prev => [
        ...prev,
        { query: searchQuery, results: data, timestamp: new Date().toISOString() }
      ]);

      const resultCount = Array.isArray(data) ? data.length : 1;
      setMessages(prev => [
        ...prev,
        {
          type: 'bot',
          content: resultCount > 0
            ? `I found ${resultCount} document${resultCount === 1 ? '' : 's'} that might be relevant to your query.`
            : "I couldn't find any documents matching your query. Try rephrasing your search."
        },
      ]);
    } catch (error) {
      console.error("Error searching documents:", error);
      setMessages(prev => [
        ...prev,
        { type: 'bot', content: "Sorry, I encountered an error while searching. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="container-fluid py-3" style={{ overflowY: 'auto', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h4 font-weight-bold">AI Document Search</h1>
          <div className="d-flex gap-2">
            <button
              onClick={() => setOpen(true)}
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
            >
              <History size={18} />
              <span>{searchHistory.length} Recent Searches</span>
            </button>
            {/* <button onClick={onClose} className="btn btn-light">
              <X size={18} />
            </button> */}
          </div>
        </div>

        <div className="row" style={{ height: 'calc(100vh - 140px)', overflowY: 'auto' }}>
          <div className="col-lg-6 mb-4">
            <div className="card h-100">
              <div className="card-header d-flex align-items-center gap-2">
                <MessageCircle className="text-primary" size={24} />
                <h2 className="h5 font-weight-semibold mb-0">AI Assistant</h2>
              </div>
              <div className="card-body overflow-auto">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`d-flex ${message.type === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                  >
                    <div
                      className={`p-2 rounded-lg mb-2 ${message.type === 'user' ? 'bg-primary text-white' : 'bg-light text-dark'}`}
                      style={{ maxWidth: '80%' }}
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
                      className="btn btn-primary m-auto "
                      style={{padding:"14px"}}
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
                  <SearchResults results={searchResults} />
                ) : (
                  <div className="text-center text-secondary">
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

      <Dialog open={open} onClose={handleClose} 
       fullWidth
       maxWidth="lg" // Options: xs, sm, md, lg, xl, or false
       sx={{ '& .MuiDialog-paper': { width: '600px', maxWidth: 'none' } }}
      >
        <DialogTitle className='dialog_head'>Recent Searches</DialogTitle>
        <DialogContent className='dialog_content'>
          <DialogContentText className='mt-4'>
          {history?.length > 0 ? (
            <div className="space-y-4">
              {history?.slice().reverse().map((item, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <button
                      onClick={() => {
                        onRerunSearch(item.query);
                        onClose();
                      }}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      "{item.query}"
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="pl-4 border-l-2 border-gray-200">
                    <SearchResults results={item.results} />
                  </div>
                </div>
              ))}
            </div>

          ) : (
            <div className="text-center text-gray-500 py-8">
              No search history yet
            </div>
          )}
            </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog_content'>
          {/* <Button className='accordian_cancel_btn' onClick={confirmDeleteFile} color="secondary">Delete</Button> */}
          <Button className='accordian_submit_btn' onClick={handleClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
{/* 
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullWidth
        maxWidth="lg" // Options: xs, sm, md, lg, xl, or false
        sx={{ '& .MuiDialog-paper': { width: '600px', maxWidth: 'none' } }}

      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Recent Searches
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          {history?.length > 0 ? (
            <div className="space-y-4">
              {history?.slice().reverse().map((item, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <button
                      onClick={() => {
                        onRerunSearch(item.query);
                        onClose();
                      }}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      "{item.query}"
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="pl-4 border-l-2 border-gray-200">
                    <SearchResults results={item.results} />
                  </div>
                </div>
              ))}
            </div>

          ) : (
            <div className="text-center text-gray-500 py-8">
              No search history yet
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} variant='contained'>
            Cancel
          </Button>
        </DialogActions>
      </BootstrapDialog> */}
    </div>
  );
};

export default AISearchDashboard;


