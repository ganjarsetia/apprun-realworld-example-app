import app, { Component, on } from 'apprun';
import { auth, tags, articles } from '../api';
import { IArticle } from '../models';
import Articles from './article-list';
import Pages from './page-list';

const PAGE_SIZE = 10
const Tag = ({ tag }) => <a href={`#/tag/${tag}/1`} className="tag-pill tag-default">{tag}</a>

declare interface IState {
  type: '' | 'feed' | 'tag'
  articles: Array<IArticle>
  tags: Array<string>
  max: number
  page: number
}

class HomeComponent extends Component {
  state: IState = {
    type: '',
    articles: [],
    tags: [],
    max: 1,
    page: 1
  };

  view = (state) => {
    const tag = state.type === 'tag' && state.tag ? `/${state.tag}` : '';
    return <div className="home-page">
      <div className="banner">
        <div className="container">
          <h1 className="logo-font">conduit</h1>
          <p>A place to share your knowledge.</p>
        </div>
      </div>
      <div className="container page">
        <div className="row">
          <div className="col-md-9">
            <div className="feed-toggle">
              <ul className="nav nav-pills outline-active">
                <li className="nav-item">
                  <a className={`nav-link ${app['user'] ? '' : 'disabled'} ${state.type === 'feed' ? 'active' : ''}`}
                    href="#/feed">Your Feed</a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link ${state.type === '' ? 'active' : ''}`} href="#/">Global Feed</a>
                </li>
                {state.tag ?
                  <li className="nav-item">
                    <a className={`nav-link ${state.type === 'tag' ? 'active' : ''}`} href={`#/tag/${state.tag}`}>#{state.tag}</a>
                  </li>
                  : ''
                }
              </ul>
            </div>
            <Articles articles={state.articles} component={this} />
            <Pages max={Math.floor(state.max / PAGE_SIZE)} selected={state.page} link={`#/${state.type}${tag}`} />
          </div>
          <div className="col-md-3">
            <div className="sidebar">
              <p>Popular Tags</p>
              <div className="tag-list">
                {state.tags.map(tag => <Tag tag={tag} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  }

  updateState = async (state, type: '' | 'feed' | 'tag', page, tag?: string) => {
    try {
      let tagList = state.tags.length
        ? { tags: state.tags }
        : await tags.all();

      page = parseInt(page) || 1;
      tag = tag || state.tag;
      const limit = PAGE_SIZE;
      const offset = (page - 1) * PAGE_SIZE;
      let feed;
      switch (type) {
        case 'feed':
          if (!auth.authorized()) return { ...state, articles: [], max: 0};
          feed = await articles.feed({ limit, offset });
          break;
        case 'tag':
          feed = await articles.search({ tag, limit, offset });
          break;
        default:
          feed = await articles.search({ limit, offset });
          break;
      }
      page = Math.min(page, Math.floor(feed.articlesCount / PAGE_SIZE) + 1);
      return {
        ...state,
        tags: tagList.tags,
        type, page, tag,
        articles: feed.articles,
        max: feed.articlesCount
      }
    } catch ({ errors }) {
      return { ...state, errors, articles: [], max: 0 }
    }
  }

  @on('#/')  root = async (state, page) => await this.updateState(state, '', page)

  @on('#/feed') feed = async (state, page) => await this.updateState(state, 'feed', page)

  @on('#/tag')  tag = async (state, tag, page) => await this.updateState(state, 'tag', page, tag)

  @on('update-article') updateArticle = (state, article) => {
    state.articles = state.articles.map(a => {
      return a.slug === article.slug ? article : a;
    })
    return state;
  }
}

export default new HomeComponent().mount('my-app')

