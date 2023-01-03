import styled from "styled-components";

interface Props {
  background: string;
  title: string;
  figure: string;
  increase: number;
  icon: any;
  onClick: () => void;
}

const SalesCard: React.FC<Props> = ({
  title,
  figure,
  increase,
  background,
  icon,
  onClick,
}) => {
  return (
    <CardWrapper style={{ background: background }} onClick={onClick}>
      <div className="content">
        <span className="heading">{title}</span>
        <span>{figure}</span>
        <span>Click on card to get more info</span>
      </div>
      <div className="icon">{icon}</div>
    </CardWrapper>
  );
};

// styles
const CardWrapper = styled.div`
  padding: 2rem 0.75rem;
  cursor: pointer;
  position: relative;
  bottom: 0;
  transition: all 0.2s ease-in-out;

  &:hover {
    bottom: 5px;
  }

  flex: 1;
  background: ${({ theme }) => theme.red};
  color: ${({ theme }) => theme.primary};

  display: grid;
  grid-template-columns: 4fr 1fr;
  align-items: center;
  border-radius: 0.75rem;
  box-shadow: ${({ theme }) => theme.shadowDark};

  span {
    display: block;
    margin-bottom: 0.75rem;
  }

  span:last-child {
    opacity: 0.8;
    font-size: 0.9rem;
  }

  .heading {
    font-weight: 700;
    font-size: 1.5rem;
  }
`;

export default SalesCard;
