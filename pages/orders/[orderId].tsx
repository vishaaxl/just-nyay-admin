import { db } from "firebase.config";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import styled from "styled-components";
import { BsCaretLeftFill, BsCaretRightFill, BsDot } from "react-icons/bs";
import { useRouter } from "next/router";
import moment from "moment";
import { useState } from "react";
import OrdersTable from "components/Tables/OrdersTable";
import { lawyersColumn } from "pages/lawyers";
import { generateUid } from "utils/main";

interface Props {
  order: string;
  user: string;
  lawyer: string;
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

  .block-one {
    .link {
      cursor: pointer;
      color: ${({ theme }) => theme.primaryAccent};
      margin-top: 0.5rem;
      text-decoration: underline;
    }
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

const OrderDetails: React.FC<Props> = ({ order, user, lawyer }) => {
  const router = useRouter();
  const planPrice = {
    15: "599",
    30: "1099",
    45: "1599",
    60: "2099",
  };

  return (
    <main>
      <GoBack onClick={() => router.back()}>
        <BsCaretLeftFill className="icon" />
        Go Back
      </GoBack>
      <Header onClick={() => router.push(`/allocate/${JSON.parse(order).id}`)}>
        <span>Status</span>
        <div style={{ color: "#FF8F00", background: "#FFF8F0" }}>
          <BsDot style={{ fontSize: "2rem" }} /> {JSON.parse(order).status}
        </div>
      </Header>

      <Content>
        <div className="block-one">
          <span className="id">
            {generateUid(
              JSON.parse(order).createdAt.seconds * 1000,
              JSON.parse(order).id
            )}
          </span>
          <span className="problemType">{JSON.parse(order).problemType}</span>
          <span
            className="link"
            onClick={() => router.push(`/bill/${JSON.parse(order).id}`)}
          >
            Generate Bill
          </span>
        </div>

        <div className="block-two">
          <span>Language: {JSON.parse(order).language}</span>
          <span>{JSON.parse(order).plan} minutes</span>
          <span>
            Due at: {moment(JSON.parse(order).date).format("MMM Do YY")}
          </span>
        </div>

        <InvoiceDetails>
          <div className="invoice-details">
            <span className="small">Invoice Date:</span>
            <span className="big">
              {moment(JSON.parse(order).createdAt.seconds * 1000).format(
                "MMM Do YY"
              )}
            </span>
          </div>
          <div className="user-details">
            <div className="small">Bill to</div>
            <div className="big">
              {JSON.parse(user).firstname} {JSON.parse(user).lastname}
            </div>
            <span>{JSON.parse(user).city}</span>
            <span>{JSON.parse(user).email}</span>
            <span>{JSON.parse(user).phoneNumber}</span>
          </div>
        </InvoiceDetails>
        {lawyer && (
          <InvoiceDetails>
            <div className="invoice-details">
              <span className="small">Assigned Date:</span>
              <span className="big">
                {moment(
                  JSON.parse(order).lawyerAssignedAt?.seconds * 1000
                ).format("MMM Do YY")}
              </span>
            </div>

            <div className="user-details">
              <div className="small">Lawyer</div>
              <div className="big">
                {JSON.parse(lawyer).firstname} {JSON.parse(lawyer).lastname}
              </div>
              <span>{JSON.parse(lawyer).city}</span>
              <span>{JSON.parse(lawyer).email}</span>
              <span>{JSON.parse(lawyer).phoneNumber}</span>

              <span
                className="redirect"
                onClick={() => router.push(`/lawyers/${JSON.parse(lawyer).id}`)}
              >
                View Details
                <BsCaretRightFill className="icon" />
              </span>
            </div>
          </InvoiceDetails>
        )}
      </Content>
      <Total>
        <span>Amount Paid</span>
        <span>
          {" "}
          &#x20b9; {
            planPrice[JSON.parse(order).plan as keyof typeof planPrice]
          }{" "}
        </span>
      </Total>
    </main>
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

  // // get the assigned Lawyer
  if (orderSnap.data()?.lawyer) {
    const lawyerRef = doc(db, "lawyers", orderSnap?.data()?.lawyer);
    const lawyerSnap = await getDoc(lawyerRef);
    return {
      props: {
        order: JSON.stringify({ ...orderSnap.data(), id: orderSnap.id }),
        user: JSON.stringify({ ...userSnap.data(), id: userSnap.id }),
        lawyer: JSON.stringify({ ...lawyerSnap.data(), id: lawyerSnap.id }),
      },
    };
  }

  return {
    props: {
      order: JSON.stringify({ ...orderSnap.data(), id: orderSnap.id }),
      user: JSON.stringify({ ...userSnap.data(), id: userSnap.id }),
      lawyer: null,
    },
  };
};

export default OrderDetails;
