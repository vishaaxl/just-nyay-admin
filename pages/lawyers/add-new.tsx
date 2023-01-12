import Input from "components/Input";
import { Form, Formik } from "formik";
import { useState } from "react";
import styled from "styled-components";
import * as Yup from "yup";

// database
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  limit,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "firebase.config";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const Container = styled.div`
  padding: 2rem 1rem;

  box-shadow: ${({ theme }) => theme.shadowPrimary};
  background-color: #fff;
  border-radius: 5px;

  h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    font-weight: 600;
    opacity: 0.9;
  }

  h4 {
    color: ${({ theme }) => theme.primaryAccent};
    font-weight: 600;
    margin: 2rem 0 1.5rem 0;
    opacity: 0.8;
    font-size: 0.9;
  }
`;

const TwoColumn = styled.div`
  @media (min-width: 767px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
`;

const Button = styled.button`
  border: none;
  padding: 0.75rem 2rem;
  outline: none;

  border-radius: 2px;
  background-color: ${({ theme }) => theme.primaryAccent};
  color: #fff;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
  }
`;

const specializationArray = [
  "Corporate Law",
  "Banking Law",
  "Cyber Law",
  "Administrative Law",
  "Intellectual Property Law",
  "Commercial Law",
  "Maritime Law",
  "Competition Law",
  "Consumer Law",
  "International Law",
  "Company Law",
  "Real Estate Law",
  "Criminal Law",
  "Civil Law",
  "Labour Law",
  "Tax Law",
  "Business Law",
  "Media Law",
  "Environmental Law",
  "Air and Space Law",
  "Energy Law",
  "Mergers and Acquisitions Law",
  "Human Rights Law",
  "Patent Law",
];

export default function AddLawyer() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <Container>
      <h2>Add Lawyer</h2>
      <Formik
        enableReinitialize
        initialValues={{
          firstname: "",
          lastname: "",
          email: "",
          state: "",
          city: "",
          specialization: "Corporate Law",
          experience: "",
          phoneNumber: "",
        }}
        validationSchema={Yup.object().shape({
          firstname: Yup.string().required("Required"),
          lastname: Yup.string().required("Required"),
          email: Yup.string().email().required("Required"),

          state: Yup.string().required("Required"),
          city: Yup.string().required("Required"),
          specialization: Yup.string().required("Required"),
          experience: Yup.number()
            .min(0, "Enter valid experience")
            .max(40, "Enter valid experience")
            .typeError("Invalid year")
            .required("Required"),
          phoneNumber: Yup.number()
            .typeError("Must be a number")
            .min(10000000, "Enter a valid number!")
            .max(100000000000, "Enter a valid number")
            .required("Required"),
        })}
        onSubmit={async (values, { resetForm }) => {
          setLoading(true);

          const docRef = collection(db, "lawyers");
          const q = query(
            docRef,
            where(
              "phoneNumber",
              "==",
              `+91${values.phoneNumber.substr(values.phoneNumber.length - 10)}`
            ),
            limit(1)
          );

          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            toast("Phone Number Already Registered", {
              type: "warning",
            });
            router.push(`/lawyers/${querySnapshot.docs[0].id}`);
            setLoading(false);
            return;
          }

          await addDoc(docRef, {
            ...values,
            verified: true,
            payment: true,
            createdAt: serverTimestamp(),
            phoneNumber: `+91${values.phoneNumber.substr(
              values.phoneNumber.length - 10
            )}`,
          })
            .then((docRef) => {
              toast("Lawyer Added Successfully", {
                type: "success",
              });
              router.push(`/lawyers/${docRef.id}`);

              setLoading(false);
            })
            .catch((err) => {
              console.log(err);
              toast("Something went Wrong", {
                type: "error",
              });
              setLoading(false);
            });

          resetForm();
        }}
      >
        {() => (
          <Form>
            <h4>Personal Details</h4>
            <TwoColumn>
              <Input placeholder="First Name" name="firstname" />
              <Input placeholder="Last Name" name="lastname" />
            </TwoColumn>
            <TwoColumn>
              <Input placeholder="State" name="state" />
              <Input placeholder="City" name="city" />
            </TwoColumn>

            <Input placeholder="Phone Number" name="phoneNumber" />
            <Input placeholder="E-mail" name="email" />

            <h4>Additional Information</h4>

            <Input
              name="specialization"
              placeholder="Specialization"
              component="select"
            >
              {specializationArray.map((e) => (
                <option value={e} key={e}>
                  {e}
                </option>
              ))}
            </Input>
            <Input
              name="experience"
              placeholder="Years of experience"
              type="number"
            />

            <Button disabled={loading}>
              {loading ? "Adding Lawyer" : "Add Lawyer"}
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
}
