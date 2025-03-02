import React from 'react';
import '../styles/AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page container">
      <div className="about-card">
        <h1>关于我们</h1>

        <div className="about-section">
          <h2>项目地址</h2>
          <p>
            <strong>国际服原项目地址：</strong>
            <a href="https://git.anna.lgbt/ascclemens/remote-party-finder" target="_blank" rel="noopener noreferrer">
              https://git.anna.lgbt/ascclemens/remote-party-finder
            </a>
          </p>
          <p>
            <strong>国服本地化后端维护地址：</strong>
            <a href="https://github.com/LittleNightmare/remote-party-finder" target="_blank" rel="noopener noreferrer">
              https://github.com/LittleNightmare/remote-party-finder
            </a>
          </p>
          <p>
            <strong>国服前端地址：</strong>
            <a href="https://github.com/Cindy-Master/remote-party-finder-frontend" target="_blank" rel="noopener noreferrer">
              https://github.com/Cindy-Master/remote-party-finder-frontend
            </a>
          </p>
        </div>

        <div className="about-section">
          <h2>API 调用方式</h2>
          <p>
            本项目提供公开 API，供开发者查询游戏内的招募信息。调用 API 时，请确保在请求头的 <code>User-Agent</code> 中注明项目名称和联系方式，以便我们联系开发者处理可能的问题。
          </p>
          <p><strong>示例：</strong></p>
          <code>User-Agent: Remote-Party-Finder-Bot (contact: example@example.com)</code>

          <h3>可用接口：</h3>
          <ul>
            <li>
              <strong>/api/listings</strong> - 获取招募列表，可使用以下查询参数：
              <ul>
                <li><code>page</code>：当前页码，默认为 1。</li>
                <li><code>per_page</code>：每页返回记录数，默认为 20，最大值 100。</li>
                <li><code>category</code>：按分类筛选。</li>
                <li><code>world</code>：按服务器筛选（匹配创建世界或主世界）。</li>
                <li><code>search</code>：关键字搜索，支持大小写不敏感匹配。</li>
                <li><code>datacenter</code>：按数据中心筛选。</li>
              </ul>
            </li>
            <li>
              <strong>/api/listing/{'{id}'}</strong> - 通过 ID 获取单个招募的详细信息。
            </li>
          </ul>
        </div>

        <div className="about-section">
          <h2>作者信息</h2>
          <p>
            本项目由多位热爱《最终幻想XIV》的开发者共同打造和维护。感谢所有为此项目贡献代码和建议的朋友们！
          </p>
        </div>

        <div className="about-section">
          <h2>免责声明</h2>
          <p>
            本网站与 Square Enix 及《最终幻想XIV》官方无关，仅为玩家提供便捷的第三方工具。所有游戏相关的名称、图像及内容的版权均归 Square Enix 所有。
          </p>
        </div>

        <div className="about-section">
          <h2>联系我们</h2>
          <p>如果您有任何问题、建议或反馈，请通过上述GitHub项目创建issue联系我们  (如有前端问题，请在国服前端项目创建issue,请勿在打扰原项目作者)</p>
          
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
