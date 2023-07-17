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

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
    15: "1999",
    30: "1099",
    45: "1599",
    60: "2099",
  };

  const generateInvoice = (orderData: any, userData: any) => {
    // send a post request with the name to our API endpoint

    const fetchData = async () => {
      const data = await fetch("/api/invoice", {
        method: "POST",
        body: JSON.stringify({
          fullname: `${userData.firstname} ${userData.lastname || ""}`,
          phoneNumber: userData.phoneNumber,
          email: userData.email,
          invoiceId: generateUid(
            orderData.createdAt?.seconds * 1000,
            orderData.id
          ),
          dateIssued: moment(orderData.createdAt?.seconds * 1000).format(
            "MMM Do YY"
          ),
          description: orderData.billDescription || "Registration Fee",
          price:
            orderData.billPrice ||
            planPrice[orderData.plan as keyof typeof planPrice],
        }),
      });
      // convert the response into an array Buffer
      return data.arrayBuffer();
    };

    // convert the buffer into an object URL
    const saveAsPDF = async () => {
      const buffer = await fetchData();
      const blob = new Blob([buffer as BlobPart]);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${generateUid(
        orderData.createdAt?.seconds * 1000,
        orderData.id
      )}.pdf`;
      link.click();
    };

    saveAsPDF();
  };

  const downloadPdf = (orderData: any, userData: any) => {
    const doc = new jsPDF();

    autoTable(doc, {
      body: [
        [
          {
            content: "JUSTNYAY",
            styles: {
              cellPadding: 5,
              halign: "left",
              fontSize: 20,
              textColor: "#ffffff",
            },
          },
          {
            content: "Invoice",
            styles: {
              halign: "right",
              cellPadding: 5,

              fontSize: 20,
              textColor: "#ffffff",
            },
          },
        ],
      ],
      theme: "plain",
      styles: {
        fillColor: "#162542",
      },
    });

    autoTable(doc, {
      body: [
        [
          {
            content:
              "Issued to:" +
              `\n${userData?.firstname} ${userData?.lastname || ""}` +
              `\n${userData?.email || ""}` +
              `\n${userData?.phoneNumber || ""}`,
            styles: {
              halign: "left",
              fontSize: 12,
            },
          },
          {
            content:
              "" +
              "\nOriginal For Customer" +
              `\nInvoice No: ${generateUid(
                orderData.createdAt?.seconds * 1000,
                orderData.id
              )}` +
              `\nDate Issued:${moment(
                orderData.createdAt?.seconds * 1000
              ).format("MMM Do YY")}`,
            styles: {
              halign: "right",
              fontSize: 12,
            },
          },
        ],
      ],
      theme: "plain",
    });

    autoTable(doc, {
      body: [
        [
          {
            content: "Products & Services",
            styles: {
              halign: "left",
              fontSize: 14,
              fontStyle: "bold",
            },
          },
        ],
      ],
      theme: "plain",
    });

    autoTable(doc, {
      head: [["Description", "Quantity", "Price", "Total"]],
      body: [
        [
          `${orderData.billDescription || "Registration Fee"}`,
          "1",
          `Rs.${
            orderData.billPrice ||
            planPrice[orderData.plan as keyof typeof planPrice]
          }`,
          `Rs.${
            orderData.billPrice ||
            planPrice[orderData.plan as keyof typeof planPrice]
          }`,
        ],
      ],
      theme: "striped",
      headStyles: {
        fillColor: "#162542",
        cellPadding: 2,
      },
      styles: {
        cellPadding: 2,
      },
    });

    autoTable(doc, {
      body: [
        [
          {
            content: "Total amount:",
            styles: {
              halign: "right",
              fontSize: 14,
              fontStyle: "bold",
            },
          },
          {
            content: `Rs.${
              orderData.billPrice ||
              planPrice[orderData.plan as keyof typeof planPrice]
            }`,
            styles: {
              halign: "right",
              fontSize: 14,
              fontStyle: "bold",
            },
          },
        ],
      ],
      theme: "plain",
    });

    autoTable(doc, {
      body: [
        [
          {
            content: "PAYMENT INFO",
            styles: {
              halign: "left",
              fontSize: 14,
            },
          },
        ],
        [
          {
            content:
              "IDFC Bank" +
              "\nAccount Name: Advozone India Private Limited" +
              "\nAccount No: 1010487398" +
              "\nIFSC Code: IDFB0021331" +
              "\nBranch: Noida Sector 63 Branch",
            styles: {
              halign: "left",
            },
          },
        ],
      ],
      theme: "plain",
    });

    autoTable(doc, {
      body: [
        [
          {
            content: "Advozone India Private Limited",
            styles: {
              halign: "center",
            },
          },
        ],
      ],
      theme: "plain",
    });

    return doc.save(
      generateUid(orderData.createdAt?.seconds * 1000, orderData.id)
    );
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
          <BsDot style={{ fontSize: "2rem" }} />{" "}
          {JSON.parse(order).status == "pending"
            ? "Assign Lawyer"
            : "Lawyer Assigned"}
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
            // onClick={() => generateInvoice(JSON.parse(order), JSON.parse(user))}
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
          &#x20b9;{" "}
          {planPrice[JSON.parse(order).plan as keyof typeof planPrice] ||
            JSON.parse(order).billPrice}{" "}
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

  const userRef = doc(
    db,
    "users",
    (orderSnap.data()?.user.uid as string) || orderSnap.data()?.user
  );
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
