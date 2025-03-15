import React from 'react';

const Header = () => {
    return (
        <header className="app-header">
            <div className="header-content">
                <h1 className="app-title">水利图谱</h1>
                <div className="app-description">
                    可视化展示先秦至清朝的水利工程、水利技术与水灾记录，揭示它们之间的历史联系
                </div>
            </div>
            <div className="header-legend">
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
                    <div className="legend-label">水利工程</div>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#FFA500' }}></div>
                    <div className="legend-label">水利技术</div>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#DC143C' }}></div>
                    <div className="legend-label">水灾记录</div>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#FFD700' }}></div>
                    <div className="legend-label">技术细节</div>
                </div>
            </div>
        </header>
    );
};

export default Header;
