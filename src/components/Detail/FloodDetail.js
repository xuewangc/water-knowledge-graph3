import React from 'react';

const FloodDetail = ({ flood }) => {
    const { data } = flood;

    return (
        <div className="flood-detail">
            <div className="detail-section">
                <h4>基本信息</h4>
                <div className="detail-item">
                    <span className="item-label">名称：</span>
                    <span className="item-value">{data.label}</span>
                </div>
                <div className="detail-item">
                    <span className="item-label">年份：</span>
                    <span className="item-value">{data.year}</span>
                </div>
            </div>

            {data.impact && (
                <div className="detail-section">
                    <h4>灾害影响</h4>
                    <p className="impact">{data.impact}</p>
                </div>
            )}

            {data.response && (
                <div className="detail-section">
                    <h4>应对措施</h4>
                    <p className="response">{data.response}</p>
                </div>
            )}

            {data.details && (
                <div className="detail-section">
                    <h4>详细描述</h4>
                    <p className="description">{data.details}</p>
                </div>
            )}

            {data.related && data.related.length > 0 && (
                <div className="detail-section">
                    <h4>相关事件</h4>
                    <ul className="related-list">
                        {data.related.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FloodDetail;
