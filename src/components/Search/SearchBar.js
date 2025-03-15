import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [searchText, setSearchText] = useState('');

    const handleInputChange = (e) => {
        setSearchText(e.target.value);
    };

    const handleSearch = () => {
        onSearch(searchText);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleClear = () => {
        setSearchText('');
        onSearch('');
    };

    return (
        <div className="search-bar">
            <div className="search-input-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="搜索水利工程、技术或水灾..."
                    value={searchText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
                {searchText && (
                    <button
                        className="clear-button"
                        onClick={handleClear}
                        title="清除搜索"
                    >
                        ×
                    </button>
                )}
            </div>
            <button className="search-button" onClick={handleSearch}>
                搜索
            </button>
        </div>
    );
};

export default SearchBar;
