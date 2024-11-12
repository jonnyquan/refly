import React, { useEffect } from 'react';
import { Divider, Layout } from 'antd';
import { SearchBox } from './components/search-box';
import { SearchProgress } from './components/search-progress';
import { SearchResults } from './components/search-results';
import { ActionMenu } from './components/action-menu';
import { SearchHome } from './components/search-home';
import { useMultilingualSearchStoreShallow } from './stores/multilingual-search';
import './index.scss';
import { IconSearch, IconRight } from '@arco-design/web-react/icon';
import { useTranslation } from 'react-i18next';

const { Header, Content } = Layout;

function MultilingualSearch() {
  const { t } = useTranslation();
  const { isSearching, results, outputLocale, pageState, resetAll, setPageState } = useMultilingualSearchStoreShallow(
    (state) => ({
      isSearching: state.isSearching,
      results: state.results,
      outputLocale: state.outputLocale,
      pageState: state.pageState,
      resetAll: state.resetAll,
      setPageState: state.setPageState,
    }),
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetAll();
    };
  }, [resetAll]);

  const handleHomeClick = () => {
    resetAll();
    setPageState('home');
  };

  return (
    <div className="multilingual-search-container">
      <div className="intergration-header">
        <div className="breadcrumb-nav">
          {pageState === 'results' ? (
            <>
              <div className="breadcrumb-item clickable" onClick={handleHomeClick}>
                <span className="menu-item-icon">
                  <IconSearch />
                </span>
                <span className="intergration-header-title">{t('resource.import.fromWebSearch')}</span>
              </div>
              <span className="breadcrumb-separator">/</span>
              <div className="breadcrumb-item">
                <span className="intergration-header-title">{t('resource.multilingualSearch.searchResults')}</span>
              </div>
            </>
          ) : (
            <>
              <span className="menu-item-icon">
                <IconSearch />
              </span>
              <span className="intergration-header-title">{t('resource.import.fromWebSearch')}</span>
            </>
          )}
        </div>
      </div>
      <Divider style={{ marginTop: 10, marginBottom: 10 }} />
      {pageState === 'home' ? (
        <SearchHome />
      ) : (
        <>
          <div
            className="multilingual-search-inner-container"
            style={{ height: isSearching ? 'calc(100% - 45px)' : 'calc(100% - 115px)' }}
          >
            <SearchBox />
            {isSearching || results?.length > 0 ? <SearchProgress /> : null}
            <SearchResults outputLocale={outputLocale} />
          </div>
          {!isSearching && results.length > 0 && (
            <div className="multilingual-search-action-menu-container">
              <ActionMenu getTarget={() => document.querySelector('.import-resource-right-panel') as HTMLElement} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MultilingualSearch;