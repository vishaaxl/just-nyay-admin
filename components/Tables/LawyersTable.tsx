import {
  doc,
  DocumentData,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useState } from "react";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useGlobalFilter, usePagination, useTable } from "react-table";
import styled from "styled-components";
import GlobalFilter from "./Filter";
import { db } from "firebase.config";

interface Props {
  tableData: any[];
  tableColumns: any[];
  tableName: string;
  orderId: string;
}

const Lawyers: React.FC<Props> = ({
  tableData,
  tableColumns,
  tableName,
  orderId,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const columns = useMemo(() => tableColumns, [tableColumns]);
  const data = useMemo(() => tableData as any[], [tableData]);

  const tableInstance = useTable(
    { columns, data, initialState: { pageIndex: 0 } },
    useGlobalFilter,
    usePagination
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
  } = tableInstance;

  const handleRedirect = async (row: any) => {
    if (loading) {
      return;
    }
    setLoading(true);
    const { id } = row;

    const docRef = doc(db, "orders", orderId);
    const data = {
      lawyer: id,
      lawyerAssignedAt: serverTimestamp(),
    };

    await updateDoc(docRef, data)
      .then(() => {
        setLoading(false);
        router.back();
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  return (
    <TableWrapper>
      <SectionHeading>{tableName}</SectionHeading>
      <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
      <Table {...getTableProps()} style={{ opacity: loading ? 0.5 : 1 }}>
        <thead>
          {headerGroups.map((headerGroup) => {
            const { key, ...restHeaderGroupProps } =
              headerGroup.getHeaderGroupProps();
            return (
              <tr key={key} {...restHeaderGroupProps}>
                {headerGroup.headers.map((column) => {
                  const { key, ...restColumn } = column.getHeaderProps();
                  return (
                    <th key={key} {...restColumn}>
                      {column.render("Header")}
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody {...getTableBodyProps}>
          {page.map((row) => {
            prepareRow(row);
            const { key, ...restRowProps } = row.getRowProps();
            return (
              <tr
                key={key}
                {...restRowProps}
                onClick={() => handleRedirect(row.original)}
              >
                {row.cells.map((cell) => {
                  const { key, ...restCellProps } = cell.getCellProps();
                  return (
                    <td key={key} {...restCellProps}>
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>

      {/* pagination config */}
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {"<<"}
        </button>{" "}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {"<"}
        </button>{" "}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {">"}
        </button>{" "}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {">>"}
        </button>{" "}
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
        <span>
          | Go to page:{" "}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: "100px" }}
          />
        </span>{" "}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </TableWrapper>
  );
};

const SectionHeading = styled.h2`
  font-size: 2rem;
  margin: 2rem 0;
  font-weight: 600;
`;

const TableWrapper = styled.section`
  overflow: scroll;

  margin: 2rem 0;
  padding: 2rem 1rem;

  box-shadow: ${({ theme }) => theme.shadowPrimary};
  background-color: #fff;
  border-radius: 5px;

  .pagination {
    margin: 4rem 0;
    text-align: center;

    button {
      margin-bottom: 1rem;
    }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;

  text-align: center;

  th {
    padding: 1.25rem 0;
    font-weight: 500;
    background: ${({ theme }) => theme.primaryAccent};
    color: ${({ theme }) => theme.primary};

    &:last-child {
      border-radius: 0 0.75rem 0.75rem 0;
    }
  }

  td {
    cursor: pointer;
    opacity: 0.9;
    padding: 1.5rem 0;
    text-transform: capitalize;
    border-bottom: 2px solid rgba(0, 0, 0, 0.05);

    &:last-child {
      font-weight: 500;

      color: ${({ theme }) => theme.primaryAccent};
    }
  }
`;

export default Lawyers;
