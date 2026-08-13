import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className={`table-container ${className}`}>
      <table className="data-table">
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '' }) => {
  return (
    <thead className={className}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<TableRowProps> = ({ children, className = '', onClick }) => {
  return (
    <tr 
      className={`${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

export const TableCell: React.FC<TableCellProps> = ({ children, className = '', colSpan }) => {
  return (
    <td className={className} colSpan={colSpan}>
      {children}
    </td>
  );
};

export const TableHead: React.FC<TableCellProps> = ({ children, className = '', colSpan }) => {
  return (
    <th className={className} colSpan={colSpan}>
      {children}
    </th>
  );
};
