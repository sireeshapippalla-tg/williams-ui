import React, { useState, useEffect } from 'react';
import { Search, Upload, Folder, File, ChevronRight, ChevronDown, X, MessageCircle, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';

const DocumentRepository = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchedFileName = location.state?.searchedFileName;
    const [fileNotFound, setFileNotFound] = useState(false);

    // Initial folders structure
    const initialFolders = [
        {
            id: '1',
            name: 'Documents',
            files: [],
            parentId: null,
            isExpanded: true,
        },
        {
            id: '2',
            name: 'Reports',
            files: [
                {
                    id: 'file1',
                    name: 'Report1.pdf',
                    size: 1024,
                    type: 'application/pdf',
                    uploadedAt: new Date().toISOString(),
                    url: '#',
                },
            ],
            parentId: null,
            isExpanded: true,
        },
    ];

    // Retrieve folders from localStorage if available
    const getInitialFolders = () => {
        const storedFolders = localStorage.getItem('folders');
        return storedFolders ? JSON.parse(storedFolders) : initialFolders;
    };

    const [folders, setFolders] = useState(getInitialFolders);
    const [selectedFolder, setSelectedFolder] = useState(folders[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAISearch, setShowAISearch] = useState(false);
    const [showAddFolderModal, setShowAddFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    useEffect(() => {
        if (searchedFileName) {
            let fileFound = false;
            let folderWithFile = null;

            folders.forEach(folder => {
                const foundFile = folder.files.find(file => file.name === searchedFileName);
                if (foundFile) {
                    fileFound = true;
                    folderWithFile = folder;
                }
            });

            if (fileFound) {
                setSelectedFolder(folderWithFile);
                setFileNotFound(false);
            } else {
                setFileNotFound(true);
                alert(`File "${searchedFileName}" was not found in the repository.`);
            }
        }
    }, [searchedFileName, folders]);

    // Save folders to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('folders', JSON.stringify(folders));
    }, [folders]);

    const ALLOWED_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
    ];

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        if (!files.length || !selectedFolder) return;

        const validFiles = files.filter(file => ALLOWED_TYPES.includes(file.type));

        const newFiles = validFiles.map(file => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            url: URL.createObjectURL(file)
        }));

        setFolders(prevFolders => {
            const updatedFolders = prevFolders.map(folder =>
                folder.id === selectedFolder.id
                    ? { ...folder, files: [...folder.files, ...newFiles] }
                    : folder
            );

            const updatedSelectedFolder = updatedFolders.find(folder => folder.id === selectedFolder.id);
            setSelectedFolder(updatedSelectedFolder);

            return updatedFolders;
        });
    };

    const handleFileDelete = (fileId) => {
        setFolders((prevFolders) => {
            const updatedFolders = prevFolders.map((folder) =>
                folder.id === selectedFolder.id
                    ? { ...folder, files: folder.files.filter((f) => f.id !== fileId) }
                    : folder
            );

            const updatedSelectedFolder = updatedFolders.find(folder => folder.id === selectedFolder.id);
            setSelectedFolder(updatedSelectedFolder);

            return updatedFolders;
        });
    };

    const toggleFolderExpansion = (folderId) => {
        setFolders(prevFolders => prevFolders.map(folder =>
            folder.id === folderId
                ? { ...folder, isExpanded: !folder.isExpanded }
                : folder
        ));
    };

    const handleFolderDelete = (folderId) => {
        setFolders((prevFolders) => prevFolders.filter(folder => folder.id !== folderId));
        if (selectedFolder && selectedFolder.id === folderId) {
            setSelectedFolder(null);
        }
    };

    const RenderFolder = ({ folder, depth = 0 }) => {
        const childFolders = folders.filter(f => f.parentId === folder.id);
        const hasChildren = childFolders.length > 0;

        return (
            <div className="user-select-none">
                <div
                    className={`d-flex align-items-center gap-2 p-2 rounded ${selectedFolder?.id === folder.id ? 'bg-light' : 'hover-bg-secondary'}`}
                    style={{ paddingLeft: `${depth * 16 + 8}px`, cursor: 'pointer' }}
                    onClick={() => setSelectedFolder(folder)}
                >
                    {hasChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFolderExpansion(folder.id);
                            }}
                            className="btn btn-sm d-flex align-items-center justify-content-center p-0 bg-light border-0 rounded"
                            style={{ width: '1rem', height: '1rem' }}
                        >
                            {folder.isExpanded ? (
                                <ChevronDown className="bi bi-chevron-down" />
                            ) : (
                                <ChevronRight className="bi bi-chevron-right" />
                            )}
                        </button>
                    )}
                    <Folder className="bi bi-folder text-primary" style={{ width: '1rem', height: '1rem' }} />
                    <span className="text-truncate">{folder.name}</span>
                    <span className="ms-auto text-muted small">
                        {folder.files.length} files
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFolderDelete(folder.id);
                        }}
                        className="btn btn-outline-danger btn-sm"
                    >
                        <Trash2 style={{ width: '1rem', height: '1rem' }} />
                    </button>
                </div>
                {folder.isExpanded && childFolders.map(childFolder => (
                    <RenderFolder
                        key={childFolder.id}
                        folder={childFolder}
                        depth={depth + 1}
                    />
                ))}
            </div>
        );
    };

    const handleAddFolder = () => {
        setShowAddFolderModal(true);
    };

    const handleSaveNewFolder = () => {
        const newFolder = {
            id: Date.now().toString(),
            name: newFolderName,
            files: [],
            parentId: null,
            isExpanded: true,
        };
        setFolders([...folders, newFolder]);
        setSelectedFolder(newFolder);
        setShowAddFolderModal(false);
        setNewFolderName('');
    };

    const getFilteredFiles = () => {
        if (!searchTerm) {
            return selectedFolder?.files || [];
        }

        return folders
            .flatMap(folder => folder.files)
            .filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()));
    };

    return (
        <div className="p-4">
            {fileNotFound && searchedFileName && (
                <div className="alert alert-warning mb-4" role="alert">
                    The file "{searchedFileName}" was not found in the repository.
                </div>
            )}

            <div className="mb-4 d-flex gap-2">
                <div className="position-relative flex-grow-1">
                    <Search className="position-absolute start-0 top-50 translate-middle-y text-muted" 
                           style={{ width: '1.25rem', height: '1.25rem', marginLeft: '1rem' }} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search files..."
                        className="form-control ps-5"
                    />
                </div>
                <button
                    onClick={() => navigate('/document/aiSearch')}
                    className="btn d-flex align-items-center gap-2 accordian_submit_btn"
                >
                    <MessageCircle style={{ width: '1.25rem', height: '1.25rem' }} />
                    AI Search
                </button>
            </div>

            <div className="row">
                <div className="col-md-4 mb-4">
                    <div className="border rounded p-3">
                        <div className="d-flex justify-content-between mb-3">
                            <h2 className="h6">Folders</h2>
                            <button
                                onClick={handleAddFolder}
                                className="btn btn-success d-flex align-items-center gap-2"
                            >
                                Add Folder
                            </button>
                        </div>

                        <div className="list-group">
                            {folders
                                .filter(folder => folder.parentId === null)
                                .map(folder => (
                                    <RenderFolder key={folder.id} folder={folder} />
                                ))}
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    {selectedFolder && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h2 className="h5">{selectedFolder.name}</h2>
                                <label className="cursor-pointer">
                                    <div className="btn btn-primary d-flex align-items-center gap-2">
                                        <Upload style={{ width: '1.25rem', height: '1.25rem' }} />
                                        Upload
                                    </div>
                                    <input
                                        type="file"
                                        className="d-none"
                                        multiple
                                        accept={ALLOWED_TYPES.join(',')}
                                        onChange={handleFileUpload}
                                    />
                                </label>
                            </div>

                            <div className="list-group">
                                {getFilteredFiles().map(file => (
                                    <div
                                        key={file.id}
                                        className={`d-flex align-items-center gap-3 list-group-item list-group-item-action ${
                                            searchedFileName === file.name ? 'bg-light' : ''
                                        }`}
                                    >
                                        <File className="text-muted" style={{ width: '1.25rem', height: '1.25rem' }} />
                                        <div className="flex-grow-1">
                                            <h3 className="h6 mb-1 text-truncate">{file.name}</h3>
                                            <small className="text-muted">
                                                {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button
                                                onClick={() => window.open(file.url, '_blank')}
                                                className="btn btn-outline-secondary btn-sm"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleFileDelete(file.id)}
                                                className="btn btn-outline-danger btn-sm"
                                            >
                                                <X style={{ width: '1.25rem', height: '1.25rem' }} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {getFilteredFiles().length === 0 && (
                                    <div className="text-center py-4 text-muted">
                                        No files found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={showAddFolderModal} onHide={() => setShowAddFolderModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>New Folder</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Folder name"
                        className="form-control"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddFolderModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveNewFolder}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default DocumentRepository;
