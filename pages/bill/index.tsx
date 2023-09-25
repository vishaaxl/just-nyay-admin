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
import { states } from "data/states";

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

const price_array = [
  {
    id: 1,
    title: "15",
    price: "499",
  },
  {
    id: 2,
    title: "30",
    price: "1099",
  },
  {
    id: 3,
    title: "45",
    price: "1599",
  },
  {
    id: 4,
    title: "60",
    price: "2099",
  },
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <Container>
      <h2>Custom Bill</h2>
      <Formik
        enableReinitialize
        initialValues={{
          firstname: "",
          lastname: "",
          phoneNumber: "",
          city: "",
          email: "",
          problemType: "Criminal / Property",
          language: "hindi",
          plan: "15",
          date: "",
          time: "9-10",
          billDescription: "",
          billPrice: "",
          state: "",
        }}
        validationSchema={Yup.object().shape({
          firstname: Yup.string().required("Required"),
          phoneNumber: Yup.string().required("Required"),
          problemType: Yup.string().required("Required"),
          language: Yup.string().required("Required"),
          plan: Yup.string().required("Required"),
          date: Yup.string().required("Required"),
          time: Yup.string().required("Required"),
          billDescription: Yup.string().when("plan", {
            is: "other",
            then: Yup.string().required("Required"),
          }),
          billPrice: Yup.string().when("plan", {
            is: "other",
            then: Yup.string().required("Required"),
          }),
        })}
        onSubmit={async (values, { resetForm }) => {
          setLoading(true);
          // check if the user is already registered
          const q = query(
            collection(db, "users"),
            where(
              "phoneNumber",
              "==",
              `+91${values.phoneNumber.substr(values.phoneNumber.length - 10)}`
            ),
            limit(1)
          );

          const querySnapshot = await getDocs(q);

          // if there exist already a user
          if (!querySnapshot.empty) {
            addDoc(collection(db, "orders"), {
              user: {
                uid: querySnapshot.docs[0].id,
                firstname: values.firstname,
                lastname: values.lastname,
                city:
                  values.city || states[values.state as keyof typeof states][0],
                state: values.state,
              },

              phoneNumber: `+91${values.phoneNumber.substr(
                values.phoneNumber.length - 10
              )}`,

              language: values.language,
              problemType: values.problemType,
              status: "pending",
              payment: true,
              plan: values.plan,
              time: values.time,
              date: values.date,
              billDescription: values.billDescription,
              billPrice: values.billPrice,
              createdAt: serverTimestamp(),
            })
              .then(async (doc) => {
                await fetch("/api/confirmation", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    phoneNumber: values.phoneNumber.substr(
                      values.phoneNumber.length - 10
                    ),
                  }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    console.log(data);
                    toast("Message sent to user", {
                      type: "success",
                    });
                  })
                  .catch((err) => console.log(err));

                router.push(`/bill/${doc.id}`);

                // redirect to continue payment and set payment true on successfull transaction
                toast("Added order successfully", {
                  type: "success",
                });

                setLoading(false);
              })
              .catch((err) => {
                toast("Something went wrong", {
                  type: "error",
                });
                setLoading(false);
              });

            resetForm();
            return;
          }

          // if user does not exist,
          addDoc(collection(db, "users"), {
            city: values.city,
            phoneNumber: `+91${values.phoneNumber.substr(
              values.phoneNumber.length - 10
            )}`,

            email: values.email,
            firstname: values.firstname,
            lastname: values.lastname,
            createdAt: serverTimestamp(),
          })
            .then((docRef) => {
              addDoc(collection(db, "orders"), {
                user: {
                  uid: docRef.id,
                  firstname: values.firstname,
                  lastname: values.lastname,
                  city:
                    values.city ||
                    states[values.state as keyof typeof states][0],
                  state: values.state,
                },

                phoneNumber: `+91${values.phoneNumber.substr(
                  values.phoneNumber.length - 10
                )}`,

                language: values.language,
                problemType: values.problemType,
                status: "pending",
                payment: true,
                plan: values.plan,
                billDescription: values.billDescription,
                billPrice: values.billPrice,
                createdAt: serverTimestamp(),
              })
                .then(async (doc) => {
                  await fetch("/api/confirmation", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      phoneNumber: values.phoneNumber.substr(
                        values.phoneNumber.length - 10
                      ),
                    }),
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      console.log(data);
                      toast("Message sent to user", {
                        type: "success",
                      });
                    })
                    .catch((err) => console.log(err));
                  // redirect to continue payment and set payment true on successfull transaction
                  toast("Added order successfully", {
                    type: "success",
                  });
                  router.push(`/bill/${doc.id}`);
                  setLoading(false);
                })
                .catch((err) => {
                  toast("Something went wrong", {
                    type: "error",
                  });
                  setLoading(false);
                });
            })
            .catch((err) => {
              toast("Something went wrong", {
                type: "error",
              });
              setLoading(false);
            });

          resetForm();
        }}
      >
        {({ values }) => (
          <Form>
            <h4>Personal Details</h4>
            <TwoColumn>
              <Input placeholder="First Name" name="firstname" />
              <Input placeholder="Last Name" name="lastname" />
            </TwoColumn>
            <Input placeholder="Phone Number" name="phoneNumber" />
            <TwoColumn>
              <Input placeholder="State" name="state" />
              <Input placeholder="City" name="city" />
            </TwoColumn>
            <Input placeholder="E-mail" name="email" />

            <h4>Order Details</h4>

            <TwoColumn>
              <Input
                placeholder="Problem Type"
                name="problemType"
                component="select"
              >
                <option disabled>Select Type</option>
                <option value="Criminal / Property">Criminal / Property</option>
                <option value="Personal/ Family">Personal/ Family</option>
                <option value="Corporate Law">Corporate Law</option>
                <option value="Civil Matters">Civil Matters</option>
                <option value="others">others</option>
              </Input>
              <Input placeholder="Language" name="language" component="select">
                <option disabled>Select Language</option>
                <option value="hindi">Hindi</option>
                <option value="english">English</option>
              </Input>
            </TwoColumn>
            <Input placeholder="Plan" name="plan" component="select">
              <option disabled>Select Plan</option>
              <option value="15">Registration Fee</option>
              <option value="other">other</option>
            </Input>
            {values.plan == "other" && (
              <>
                <Input placeholder="Bill Description" name="billDescription" />
                <Input
                  placeholder="Price (Rs.)"
                  name="billPrice"
                  type="number"
                />
              </>
            )}

            <TwoColumn>
              <Input
                name="date"
                placeholder="Date for consultation"
                type="date"
                min={new Date().toISOString().split("T")[0]}
              />
              <Input name="time" placeholder="Time" component="select">
                <option disabled>Choose schedule</option>
                <option value="9-10">9 - 10</option>
                <option value="10-11">10 - 11</option>
                <option value="11-12">11 - 12</option>
                <option value="12-13">12 - 13</option>
                <option value="13-14">13 - 14</option>
                <option value="14-15">14 - 15</option>
                <option value="15-16">15 - 16</option>
                <option value="16-17">16 - 17</option>
                <option value="17-18">17 - 18</option>
                <option value="18-19">18 - 19</option>
                <option value="19-20">19 - 20</option>
                <option value="20-21">20 - 21</option>
              </Input>
            </TwoColumn>

            <Button disabled={loading}>
              {loading ? "Adding Order" : "Add Order"}
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
}
