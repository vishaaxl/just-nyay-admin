import { db } from "firebase.config";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import styled from "styled-components";
import { BsCaretLeftFill, BsCaretRightFill, BsDot } from "react-icons/bs";
import { useRouter } from "next/router";
import moment from "moment";
import { useState, useEffect } from "react";
import { useAuth } from "context/User";
import Invoice from "components/Invoice";

interface Props {
  order: string;
  user: string;
  lawyer: string;
  lawyerId: string;
}

const Header = styled.div`
  margin-top: 1rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 5px;
  box-shadow: ${({ theme }) => theme.shadowPrimary}
  padding: 1rem;
  font-weight: 500;
  div {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(0, 0, 0, 0.025);
    border-radius: 5px;
  }
`;

const GoBack = styled.div`
  cursor: pointer;
  padding-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  .icon {
    color: ${({ theme }) => theme.primaryAccentLight};
  }
`;

const Content = styled.div`
  padding: 1rem 1rem 3rem 1rem;
  background-color: #fff;
  margin-top: 1rem;
  border-radius: 5px 5px 0 0;
  .id {
    font-size: 1.0125rem;
    font-weight: 500;
    margin-bottom: 1rem;
  }
  span {
    display: block;
  }
  .problemType {
    opacity: 0.6;
  }
  .block-two {
    margin-top: 2.5rem;
    span {
      opacity: 0.7;
      margin-bottom: 0.45rem;
    }
  }
`;

const InvoiceDetails = styled.div`
  margin-top: 2.5rem;
  @media (min-width: 425px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .small {
    opacity: 0.6;
    font-size: 0.9rem;
    padding-bottom: 1rem;
  }
  .big {
    font-size: 1.5rem;
    font-weight: 600;
    opacity: 0.95;
    padding-bottom: 0.75rem;
  }
  .user-details {
    span {
      opacity: 0.7;
      margin-bottom: 0.45rem;
    }
  }
  .redirect {
    display: flex;
    align-items: center;
    .icon {
      margin-left: 0.5rem;
    }
    margin-top: 1rem;
    color: ${({ theme }) => theme.primaryAccent};
    opacity: 1 !important;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Total = styled.div`
  background-color: ${({ theme }) => theme.secondary};
  padding: 2rem 2rem;
  border-radius: 0 0 5px 5px;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  span {
    display: block;
  }
  span:last-child {
    font-weight: 500;
    font-size: 1.75rem;
  }
`;

const Main = styled.div`
  width: 95%;
  max-width: 60rem;
  margin: 0 auto;
`;

const InvoicePage: React.FC<Props> = ({ order, user }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Invoice user={JSON.parse(user)} order={JSON.parse(order)} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // get order details
  const { orderId } = context.query;
  const orderRef = doc(db, "orders", orderId as string);
  const orderSnap = await getDoc(orderRef);

  // get the user who made the offer
  const userRef = doc(db, "users", orderSnap.data()?.user.uid as string);
  const userSnap = await getDoc(userRef);

  return {
    props: {
      order: JSON.stringify({ ...orderSnap.data(), id: orderSnap.id }),
      user: JSON.stringify({ ...userSnap.data(), id: userSnap.id }),
    },
  };
};

export default InvoicePage;
