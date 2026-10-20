'use client';

import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { errorMessage } from '@/api/client';
import { ua } from '@/i18n/ua';

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right';
  nowrap?: boolean;
}

export const PAGE_SIZES = [20, 50];

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  error,
  total,
  page,
  limit,
  onPage,
  onLimit,
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string | number;
  loading: boolean;
  error?: unknown;
  total?: number;
  page?: number;
  limit?: number;
  onPage?: (page: number) => void;
  onLimit?: (limit: number) => void;
  onRowClick?: (row: T) => void;
}) {
  if (error) return <Alert severity="error">{errorMessage(error)}</Alert>;
  if (loading && !rows)
    return <Skeleton variant="rounded" height={360} sx={{ borderRadius: '20px' }} />;

  return (
    <Paper sx={{ borderRadius: '20px', overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key} align={column.align} sx={{ fontWeight: 700 }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.length ? (
              rows.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  hover={Boolean(onRowClick)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      align={column.align}
                      sx={{ whiteSpace: column.nowrap ? 'nowrap' : 'normal' }}
                    >
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    {ua.admin.empty}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {total !== undefined && page !== undefined && limit !== undefined && onPage && (
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          rowsPerPage={limit}
          rowsPerPageOptions={PAGE_SIZES}
          onPageChange={(_e, next) => onPage(next + 1)}
          onRowsPerPageChange={(e) => onLimit?.(Number(e.target.value))}
          labelRowsPerPage={ua.admin.rowsPerPage}
          labelDisplayedRows={ua.admin.rowsRange}
        />
      )}
    </Paper>
  );
}
