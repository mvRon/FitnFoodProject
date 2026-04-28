import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CloseCircleFilled, SearchOutlined } from '@ant-design/icons';
import {
  SearchShell,
  SearchInput,
  SearchButton,
  SearchIconWrap,
  ClearButton,
  SuggestionsPanel,
  SuggestionItem,
  SuggestionThumb,
  SuggestionInfo,
  SuggestionName,
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
      <SearchInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
      />
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
              <SuggestionThumb src={item?.images?.[0] || item?.image || ''} alt={item?.name || 'product'} />
              <SuggestionInfo>
                <SuggestionName>{item?.name || 'San pham'}</SuggestionName>
                <SuggestionMeta>
                  {convertPrice(item?.price) || ''}{item?.discount ? ` • Giam ${item.discount}%` : ''}
                </SuggestionMeta>
              </SuggestionInfo>
            </SuggestionItem>
          ))}
          {!isLoading && suggestions.length > 0 && (
            <SuggestionsFooter
              type="button"
              onMouseDown={() => onSearch && onSearch(value || '')}
            >
              Xem tất cả kết quả
            </SuggestionsFooter>
          )}
        </SuggestionsPanel>,
        document.body
      )}
    </SearchShell>
  );
};

export default SearchComponent;
