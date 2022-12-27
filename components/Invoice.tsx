import Image from "next/image";
import styled from "styled-components";
import { useRef } from "react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { DocumentData } from "firebase/firestore";

import moment from "moment";
import { generateUid } from "utils/main";

interface Props {
  ref: any;
}

interface InvoiceProps {
  user: DocumentData;
  order: DocumentData;
}

const Content = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  span {
    display: block;
    line-height: 1.4;
    text-transform: capitalize;
  }

  .fade {
    opacity: 0.6;
  }
  .bold {
    font-weight: 500;
  }

  .content-wrapper {
    width: 90%;
    height: 70%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .row-one {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 2rem;
  }

  .table {
    width: 100%;

    .table-header {
      background: #162542;
      color: #f4f4f4;
    }

    & > * {
      padding: 1rem;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
    }

    .row {
      border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    .payment-info {
      .bold {
        padding-bottom: 0.5rem;
      }
    }
  }
`;

const InvoiceWrapper = styled.div<Props>`
  position: relative;
  width: fit-content;
`;

const Main = styled.div`
  overflow: scroll;

  display: flex;
  flex-direction: column;

  @media (min-width: 425px) {
    align-items: center;
  }

  padding: 2rem 0;

  .primary-btn {
    margin-top: 1rem;
  }
`;

const Button = styled.div`
  background-color: ${({ theme }) => theme.primaryAccent};
  color: #fff;
  padding: 0.75rem 1.5rem;
  margin-top: 0.5rem;
  border-radius: 2px;

  cursor: pointer;
`;

const Invoice: React.FC<InvoiceProps> = ({ order, user }) => {
  const invoiceRef = useRef<HTMLDivElement | string>("undefined");

  const generatePdf = () => {
    // @ts-ignore
    html2canvas(invoiceRef.current).then((canvas) => {
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      pdf.addImage(img, "JPEG", 0, 0, 595, 842);
      pdf.save(generateUid(order.createdAt?.seconds * 1000, order.id));
    });
  };

  const prices = {
    "15": 599,
    "30": 1099,
    "45": 1599,
    "60": 2099,
  };

  return (
    <Main>
      <InvoiceWrapper ref={invoiceRef}>
        <Image
          priority
          src="/images/invoice-bg.png"
          height={842}
          width={595}
          alt=""
          layout="fixed"
        />
        <Content>
          <div className="content-wrapper">
            <div className="row-one">
              <div className="block-one">
                <span className="fade">Issued to:</span>
                <span className="bold">
                  {user?.firstname} {user?.lastname}
                </span>
                <span className="bold">{user?.phoneNumber}</span>
                <span className="bold" style={{ textTransform: "lowercase" }}>
                  {user.email}
                </span>
              </div>
              <div className="block-two">
                <span className="bold">Original for Customer</span>
                <span className="bold">
                  Invoice No :{" "}
                  {generateUid(order.createdAt?.seconds * 1000, order.id)}
                </span>
                <span className="bold">
                  Date issued :{" "}
                  {moment(order.createdAt?.seconds * 1000).format("MMM Do YY")}
                </span>
              </div>
            </div>
            <div className="table">
              <div className="table-header">
                <span>Description</span>
                <span>Quantity</span>
                <span>Price</span>
                <span>Total</span>
              </div>
              <div className="row">
                <span>Registration Fee</span>
                <span>1</span>
                <span>Rs. {prices[order.plan as keyof typeof prices]}</span>
                <span>Rs. {prices[order.plan as keyof typeof prices]}</span>
              </div>
              <div className="summary">
                <span></span>
                <span></span>
                <span className="bold">Total</span>
                <span className="bold">
                  Rs. {prices[order.plan as keyof typeof prices]}
                </span>
              </div>
            </div>

            <div className="footer">
              <div className="payment-info">
                <span className="bold">PAYMENT INFO</span>
                <span>IDFC Bank</span>
                <span>Account Name: Advozone India Private Limited</span>
                <span>Account No: 1010487398</span>
                <span>IFSC Code: IDFB0021331</span>
                <span>Branch: Noida Sector 63 Branch</span>
              </div>
              <div className="sign">
                <Image
                  src="/images/signature.png"
                  alt=""
                  height={180}
                  width={165}
                />
              </div>
            </div>
          </div>
        </Content>
      </InvoiceWrapper>

      <Button onClick={() => generatePdf()}>Download Invoice</Button>
    </Main>
  );
};

export default Invoice;
