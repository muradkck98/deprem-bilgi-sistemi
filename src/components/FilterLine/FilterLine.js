import React from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
  display: flex;
  gap: 20px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 120px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #333;
`;

function FilterLine({ filters, onFilterChange }) {
  return (
    <FilterContainer>
      <FilterGroup>
        <Label>Başlangıç Tarihi:</Label>
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) => onFilterChange('startDate', e.target.value)}
        />
      </FilterGroup>

      <FilterGroup>
        <Label>Bitiş Tarihi:</Label>
        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) => onFilterChange('endDate', e.target.value)}
        />
      </FilterGroup>

      <FilterGroup>
        <Label>Min Büyüklük:</Label>
        <Input
          type="number"
          min="0"
          step="0.1"
          value={filters.minMagnitude}
          onChange={(e) => onFilterChange('minMagnitude', e.target.value)}
        />
      </FilterGroup>
    </FilterContainer>
  );
}

export default FilterLine;