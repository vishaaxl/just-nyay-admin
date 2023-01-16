import { db } from "firebase.config";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { BsCaretLeftFill, BsDot } from "react-icons/bs";
import styled from "styled-components";
import moment from "moment";
import OrdersTable from "components/Tables/OrdersTable";
import { generateUid } from "utils/main";

interface Props {
  user: string;
  orders: string;
}

export const Header = styled.div`
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

export const GoBack = styled.div`
  cursor: pointer;
  padding-top: 1rem;

  display: flex;
  align-items: center;
  gap: 1rem;

  .icon {
    color: ${({ theme }) => theme.primaryAccentLight};
  }
`;

export const Content = styled.div`
  padding: 1rem 1rem 3rem 1rem;
  background-color: #fff;
  margin-top: 1rem;
  border-radius: 5px 5px 0 0;

  .id {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  span {
    display: block;
  }

  .problemType {
    opacity: 0.6;
    font-size: 0.9rem;
  }

  .block-two {
    font-weight: 500;
    margin-top: 2.5rem;

    span {
      opacity: 0.7;
      margin-bottom: 0.45rem;
    }
  }
`;

export const InvoiceDetails = styled.div`
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
`;

export const Total = styled.div`
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

export const orderColumn = [
  {
    Header: "Order ID",
    accessor: "uid" as const, // accessor is the "key" in the data
  },
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

const UserDetails: React.FC<Props> = ({ user, orders }) => {
  const router = useRouter();

  const totalMinutes = () => {
    return JSON.parse(orders).reduce(
      (acc: number, curr: any) => acc + Number(curr.plan),
      0
    );
  };

  const getMinutes = () => {
    let minutes = totalMinutes();
    let hours = 0;

    while (minutes >= 60) {
      minutes = minutes - 60;
      hours++;
    }

    return `${hours}h ${minutes}minutes`;
  };

  return (
    <main>
      <GoBack onClick={() => router.back()}>
        <BsCaretLeftFill className="icon" />
        Go Back
      </GoBack>
      <Header>
        <span>Active Cases</span>
        <div
          style={{ color: "#33D69F", background: "#F3FDF9" }}
          onClick={() =>
            document &&
            document.getElementById("active_cases_cs")?.scrollIntoView({
              behavior: "smooth",
            })
          }
        >
          <BsDot style={{ fontSize: "2rem" }} /> {JSON.parse(orders).length}{" "}
          Active
        </div>
      </Header>
      <Content>
        <div className="block-one">
          <span className="id">
            {JSON.parse(user).firstname} {JSON.parse(user).lastname}
          </span>
          <span className="problemType">
            {generateUid(
              JSON.parse(user).createdAt.seconds * 1000,
              JSON.parse(user).id
            )}
          </span>
        </div>

        <InvoiceDetails>
          <div className="invoice-details">
            <span className="small">Registed:</span>
            <span className="big">
              {moment(JSON.parse(user).createdAt?.seconds * 1000).format(
                "MMM Do YY"
              )}
            </span>
          </div>
          <div className="user-details">
            <div className="small">Details</div>
            <div className="big">{JSON.parse(user).email}</div>
            <span>{JSON.parse(user).city}</span>
            {JSON.parse(user).state && (
              <span>{JSON.parse(user).state}, India</span>
            )}
            <span>{JSON.parse(user).phoneNumber}</span>
          </div>
        </InvoiceDetails>
      </Content>
      <Total>
        <span>Balance</span>
        <span>{getMinutes()}</span>
      </Total>

      <div id="active_cases_cs">
        <OrdersTable
          tableData={JSON.parse(orders).map((order: any) => ({
            ...order,
            uid: generateUid(order.createdAt.seconds * 1000, order.id),
          }))}
          tableColumns={orderColumn}
          tableName={`Orders From ${JSON.parse(user).firstname}`}
          path="orders"
        />
      </div>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { userId } = context.query;
  const ordersQuery = query(
    collection(db, "orders"),
    where("user", "==", userId),
    where("payment", "==", true)
  );

  const ordersSnapShot = await getDocs(ordersQuery);

  const userRef = doc(db, "users", userId as string);
  const userSnap = await getDoc(userRef);

  const orders: DocumentData[] = [];
  ordersSnapShot.forEach((doc) => {
    orders.push({ ...doc.data(), id: doc.id });
  });

  return {
    props: {
      user: JSON.stringify({ ...userSnap.data(), id: userSnap.id }),
      orders: JSON.stringify(orders),
    },
  };
};

export default UserDetails;
