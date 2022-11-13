import SalesCard from "components/Card";
import OrdersTable from "components/Tables/OrdersTable";
import { db } from "firebase.config";
import { collection, DocumentData, getDocs } from "firebase/firestore";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import {
  AiOutlineBarChart,
  AiOutlineLineChart,
  AiOutlineUserAdd,
} from "react-icons/ai";
import styled from "styled-components";

interface Props {
  users: DocumentData;
  lawyers: DocumentData;
  interns: DocumentData;
  orders: DocumentData;
}

const CardsWrapper = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: 425px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const orderColumn = [
  {
    Header: "Plan",
    accessor: "plan" as const, // accessor is the "key" in the data
  },
  {
    Header: "Language",
    accessor: "language" as const,
  },
  {
    Header: "Type",
    accessor: "problemType" as const,
  },
  {
    Header: "Status",
    accessor: "status" as const,
  },
];

export default function Home({ users, lawyers, interns, orders }: Props) {
  const cardsData = [
    {
      id: 1,
      title: "Total Orders",
      figure: `${orders.length} orders`,
      increase: orders.length * 10,
      background: "#98BDFF",
      icon: <AiOutlineBarChart style={{ fontSize: "2.5rem" }} />,
    },
    {
      id: 2,
      title: "Total Lawyers",
      figure: `${lawyers.length} users`,
      increase: lawyers.length * 10,
      background: "#F3797E",
      icon: <AiOutlineLineChart style={{ fontSize: "2.5rem" }} />,
    },
    {
      id: 3,
      title: "Total Users",
      figure: `${users.length} users`,
      increase: users.length * 10,
      background: "#7978E9",
      icon: <AiOutlineUserAdd style={{ fontSize: "2.5rem" }} />,
    },
    {
      id: 4,
      title: "Total Inters",
      figure: `${interns.length} interns`,
      increase: interns.length * 10,
      background: "#7DA0FA",
      icon: <AiOutlineUserAdd style={{ fontSize: "2.5rem" }} />,
    },
  ];

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CardsWrapper>
        {cardsData.map((card) => (
          <SalesCard
            key={card.id}
            title={card.title}
            icon={card.icon}
            background={card.background}
            figure={card.figure}
            increase={card.increase}
          />
        ))}
      </CardsWrapper>

      <OrdersTable
        tableData={orders}
        tableColumns={orderColumn}
        tableName="Recent Orders"
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const userRef = collection(db, "users");
  const lawyersRef = collection(db, "lawyers");
  const internsRef = collection(db, "interns");
  const ordersRef = collection(db, "orders");

  const userSnap = await getDocs(userRef);
  const lawyersSnap = await getDocs(lawyersRef);
  const internsSnap = await getDocs(internsRef);
  const ordersSnap = await getDocs(ordersRef);

  const users: DocumentData[] = [],
    lawyers: DocumentData[] = [],
    interns: DocumentData[] = [],
    orders: DocumentData[] = [];

  userSnap.forEach((doc) => {
    users.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  lawyersSnap.forEach((doc) => {
    lawyers.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  internsSnap.forEach((doc) => {
    interns.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  ordersSnap.forEach((doc) => {
    orders.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  return {
    props: {
      users,
      lawyers,
      interns,
      orders,
    },
  };
};
