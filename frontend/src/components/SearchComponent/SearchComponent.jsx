import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CloseCircleFilled, SearchOutlined } from '@ant-design/icons';
import {
  SearchShell,
  InputContainer,
  GhostText,
  SearchInput,
  SearchButton,
  SearchIconWrap,
  ClearButton,
  SuggestionsPanel,
  SuggestionItem,
  SuggestionThumb,
  SuggestionInfo,
  SuggestionTitleRow,
  SuggestionName,
  SemanticBadge,
  SuggestionMeta,
  SuggestionStatus,
  SuggestionsFooter,
} from './Style';
import { convertPrice } from '../../utils';

const SearchComponent = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Tìm kiếm sản phẩm',
  buttonText = 'Tìm kiếm',
  disabled = false,
  suggestions = [],
  showSuggestions = false,
  isLoading = false,
  emptyMessage = 'Không tìm thấy sản phẩm nào',
  onSelectSuggestion,
  onFocus,
  onBlur,
  onClear,
  onLoadMore,
  totalSuggestions = 0,
}) => {
  const shellRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSearch) {
      onSearch(value || '');
    }
  };

  const hasQuery = Boolean(value && String(value).trim().length > 0);
  const shouldShow = showSuggestions && (hasQuery || isLoading || suggestions.length > 0);

  const handleClear = () => {
    if (disabled) return;
    if (onClear) {
      onClear();
      return;
    }
    if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  // Determine Ghost Text
  let ghostSuggestion = null;
  let restOfGhostText = '';
  if (hasQuery && suggestions.length > 0) {
    const firstMatch = suggestions.find(s => s.name && s.name.toLowerCase().startsWith(String(value).toLowerCase()));
    if (firstMatch) {
      ghostSuggestion = firstMatch;
      restOfGhostText = firstMatch.name.substring(String(value).length);
    }
  }

  const handleKeyDown = (e) => {
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && ghostSuggestion) {
      e.preventDefault();
      if (onChange) {
        onChange({ target: { value: ghostSuggestion.name } });
      }
    }
  };

  const updateDropdownPosition = () => {
    if (!shellRef.current) return;
    const rect = shellRef.current.getBoundingClientRect();
    const offset = rect.width < 520 ? 6 : 10;
    setDropdownStyle({
      top: rect.bottom + offset,
      left: rect.left,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (!shouldShow) return;
    updateDropdownPosition();
  }, [shouldShow, value, suggestions.length]);

  useEffect(() => {
    if (!shouldShow) return undefined;

    const handleReposition = () => updateDropdownPosition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [shouldShow]);

  return (
    <SearchShell ref={shellRef} onSubmit={handleSubmit} aria-label="Tìm kiếm sản phẩm">
      <SearchIconWrap aria-hidden="true">
        <SearchOutlined />
      </SearchIconWrap>
      <InputContainer>
        {ghostSuggestion && (
          <GhostText>
            <span style={{ visibility: 'hidden' }}>{value}</span>
            {restOfGhostText}
          </GhostText>
        )}
        <SearchInput
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={placeholder}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </InputContainer>
      {hasQuery && (
        <ClearButton type="button" onClick={handleClear} disabled={disabled} aria-label="Xóa nội dung tìm kiếm">
          <CloseCircleFilled />
        </ClearButton>
      )}
      <SearchButton type="submit" disabled={disabled}>
        {buttonText}
      </SearchButton>
      {shouldShow && createPortal(
        <SuggestionsPanel style={dropdownStyle}>
          {isLoading && <SuggestionStatus>Đang tìm gợi ý</SuggestionStatus>}
          {!isLoading && hasQuery && suggestions.length === 0 && (
            <SuggestionStatus>{emptyMessage}</SuggestionStatus>
          )}
          {!isLoading && suggestions.map((item) => (
            <SuggestionItem
              key={item?._id}
              type="button"
              onMouseDown={() => onSelectSuggestion && onSelectSuggestion(item)}
            >
              {item?.images?.[0] || item?.image ? (
                <SuggestionThumb src={item?.images?.[0] || item?.image} alt={item?.name || 'product'} />
              ) : (
                <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: 4, marginRight: 12 }}>
                  <SearchOutlined style={{ color: '#999', fontSize: 16 }} />
                </div>
              )}
              <SuggestionInfo>
                <SuggestionTitleRow>
                  <SuggestionName title={item?.name || 'Sản phẩm'}>
                    {item?.name || 'Sản phẩm'}
                  </SuggestionName>
                  {item?.isSemanticOnly && <SemanticBadge>Gợi ý thêm</SemanticBadge>}
                </SuggestionTitleRow>
                <SuggestionMeta>
                  {convertPrice(item?.price) || ''}{item?.discount ? ` • Giảm ${item.discount}%` : ''}
                </SuggestionMeta>
              </SuggestionInfo>
            </SuggestionItem>
          ))}
          {!isLoading && suggestions.length > 0 && suggestions.length < totalSuggestions && (
            <SuggestionsFooter
              type="button"
              onMouseDown={onLoadMore}
            >
              Xem thêm gợi ý
            </SuggestionsFooter>
          )}
        </SuggestionsPanel>,
        document.body
      )}
    </SearchShell>
  );
};

export default SearchComponent;
