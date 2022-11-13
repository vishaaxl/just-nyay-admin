import styled from "styled-components";

interface Props {
  filter: string;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
}

const Filter = styled.span`
  display: block;
  margin-bottom: 1rem;

  input {
    opacity: 0.9;
    font-size: 1rem;
    border: none;
    border-bottom: 2px solid ${({ theme }) => theme.primaryAccentLight};
    outline: none;
    padding: 0.25rem 0.75rem;
  }
`;

const GlobalFilter: React.FC<Props> = ({ filter, setFilter }) => {
  return (
    <Filter>
      Global Filter{" "}
      <input value={filter || ""} onChange={(e) => setFilter(e.target.value)} />
    </Filter>
  );
};

export default GlobalFilter;
