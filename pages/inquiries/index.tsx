import OrdersTable from "components/Tables/OrdersTable";
import { db } from "firebase.config";
import {
  collection,
  DocumentData,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import moment from "moment";
import { GetServerSideProps } from "next";
import Head from "next/head";

import styled from "styled-components";
import { generateUid } from "utils/main";

interface Props {
  users: string;
}

const usersColumn = [
  {
    Header: "Dated",
    accessor: "date" as const,
  },
  {
    Header: "E-mail",
    accessor: "email" as const,
  },
  {
    Header: "Description",
    accessor: "description" as const,
  },
  {
    Header: "Phone Number",
    accessor: "phoneNumber" as const,
  },
];

export default function Home({ users }: Props) {
  return (
    <>
      <Head>
        <title>Admin | JustNyay</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <OrdersTable
        tableData={JSON.parse(users).map((order: any) => ({
          ...order,
          date: moment(order.createdAt.seconds * 1000).format("MMM Do YY"),
        }))}
        tableColumns={usersColumn}
        tableName="All Inquiries"
        path="interns"
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const usersRef = query(
    collection(db, "inquiries"),
    orderBy("createdAt", "desc")
  );

  const usersSnap = await getDocs(usersRef);

  const users: DocumentData[] = [];

  usersSnap.forEach((doc) => {
    users.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  return {
    props: {
      users: JSON.stringify(users),
    },
  };
};
