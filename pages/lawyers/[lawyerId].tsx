import { db } from "firebase.config";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import {
  GoBack,
  Header,
  InvoiceDetails,
  Content,
  orderColumn,
  Total,
} from "pages/customers/[userId]";
import { BsCaretLeftFill, BsDot } from "react-icons/bs";
import { VscVerified, VscUnverified } from "react-icons/vsc";
import moment from "moment";
import { useState } from "react";
import OrdersTable from "components/Tables/OrdersTable";
import { generateUid } from "utils/main";

interface Props {
  user: string;
  orders: string;
}

const LawyerDetails: React.FC<Props> = ({ user, orders }) => {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(JSON.parse(user).verified);
  const router = useRouter();

  const toggleVerify = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    const docRef = doc(db, "lawyers", JSON.parse(user).id);
    const data = {
      verified: !JSON.parse(user).verified,
    };

    await updateDoc(docRef, data)
      .then(() => {
        setLoading(false);
        setVerified((prev: boolean) => !prev);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  return (
    <main>
      <GoBack onClick={() => router.back()}>
        <BsCaretLeftFill className="icon" />
        Go Back
      </GoBack>
      <Header>
        <span>Active Cases</span>
        <div style={{ color: "#33D69F", background: "#F3FDF9" }}>
          <BsDot style={{ fontSize: "2rem" }} /> {JSON.parse(orders).length}{" "}
          Active
        </div>
      </Header>
      <Header>
        <span>Verified Lawyer</span>
        <div
          onClick={() => toggleVerify()}
          style={{
            color: verified ? "#33D69F" : "#FF8F00",
            background: verified ? "#F3FDF9" : "#FFF8F0",
            padding: "1.125rem",
          }}
        >
          {" "}
          {verified ? (
            <VscVerified
              style={{ fontSize: "1.25rem", marginRight: ".5rem" }}
            />
          ) : (
            <VscUnverified
              style={{ fontSize: "1.25rem", marginRight: ".5rem" }}
            />
          )}
          {verified ? "Verified" : "Not Verified"}
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

        <div className="block-two">
          <div className="id">Details</div>
          <span className="problemType">
            Council ID: {JSON.parse(user).barCouncilId}
          </span>
          <span className="problemType">Year: {JSON.parse(user).year}</span>
          <span className="problemType">
            Experience: {JSON.parse(user).experience} years
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
            <div className="small">Personal</div>
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
        <span>Payment Left</span>
        <span>&#x20b9; 0</span>
      </Total>
      <OrdersTable
        tableData={JSON.parse(orders).map((order: any) => {
          return {
            ...order,
            firstname: order.user.firstname || "older data",
            city: order.user.city || "older data",
            uid: generateUid(order.createdAt.seconds * 1000, order.id),
          };
        })}
        tableColumns={orderColumn}
        tableName={`Cases From ${JSON.parse(user).firstname}`}
        path="orders"
      />
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { lawyerId } = context.query;
  const ordersQuery = query(
    collection(db, "orders"),
    where("lawyer", "==", lawyerId)
  );

  const ordersSnapShot = await getDocs(ordersQuery);

  const userRef = doc(db, "lawyers", lawyerId as string);
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

export default LawyerDetails;
