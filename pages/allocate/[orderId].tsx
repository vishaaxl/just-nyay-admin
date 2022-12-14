import LawyersTable from "components/Tables/LawyersTable";
import { db } from "firebase.config";
import { collection, DocumentData, getDocs } from "firebase/firestore";
import { GetServerSideProps } from "next";
import Head from "next/head";

interface Props {
  users: string;
  orderId: string;
}

export const lawyersColumn = [
  {
    Header: "Lawyer ID",
    accessor: "id" as const, // accessor is the "key" in the data
  },
  {
    Header: "Name",
    accessor: "firstname" as const, // accessor is the "key" in the data
  },
  {
    Header: "E-mail",
    accessor: "email" as const,
  },
  {
    Header: "Phone Number",
    accessor: "phoneNumber" as const,
  },
  {
    Header: "City",
    accessor: "city" as const,
  },
  {
    Header: "experience",
    accessor: "experience" as const,
  },
];

export default function Home({ users, orderId }: Props) {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <LawyersTable
        tableData={JSON.parse(users)}
        tableColumns={lawyersColumn}
        tableName="Select Lawyer"
        orderId={orderId}
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { orderId } = context.query;
  const usersRef = collection(db, "lawyers");

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
      orderId,
    },
  };
};
