import React, { useEffect, useState } from "react";
import { Card, Row } from "antd";
import { Line, Pie } from "@ant-design/charts";
import moment from "moment";
import TransactionSearch from "./TransactionSearch";
import Header from "./Header";
import AddIncomeModal from "./Modals/AddIncome";
import AddExpenseModal from "./Modals/AddExpense";
import Cards from "./Cards";
import NoTransactions from "./NoTransactions";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { addDoc, collection, getDocs, query } from "firebase/firestore";
import Loader from "./Loader";
import { toast } from "react-toastify";
import { unparse } from "papaparse";

const Dashboard = () => {
  const [user] = useAuthState(auth);
  
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);


  // line chart and pie chart----

  const processChartData = () => {
    const balanceData = [];
    const spendingData = {};
  
    transactions.forEach((transaction) => {
      const monthYear = moment(transaction.date).format("MMM YYYY");
      const tag = transaction.tag;
  
    
      // Process income transactions
      if (transaction.type === "income") {
        // Update existing month balance or add a new entry
        const existingBalanceEntry = balanceData.find((data) => data.newMonthYear === monthYear);

        if (existingBalanceEntry) {
          existingBalanceEntry.balance += transaction.amount;
        } else {
          balanceData.push({ newMonthYear: monthYear, balance: transaction.amount });
        }
      } 


      // Process expense transactions
      else {
        // Update existing month balance or add a new entry
        const existingBalanceEntry = balanceData.find((data) => data.newMonthYear === monthYear);
        if (existingBalanceEntry) {
          existingBalanceEntry.balance -= transaction.amount;
        } else {
          balanceData.push({ newMonthYear: monthYear, balance: -transaction.amount });
        }
  
        // Update spending data by category
        if (spendingData[tag]) {
          spendingData[tag] += transaction.amount;
         
        } else {
          spendingData[tag] = transaction.amount;
         
        }
      }
    });
  

    // Convert spending data object to an array for the pie chart
    const spendingDataArray = Object.keys(spendingData).map((key) => ({
      category: key,
      value: spendingData[key],
    }));
  
    return { balanceData, spendingDataArray };
  };
  
    const { balanceData, spendingDataArray } = processChartData();

  //  const balanceConfig = {
  //   data: balanceData,
  //   xField: "newMonthYear",
  //   yField: "balance",
  // };

  // const spendingConfig = {
  //   data: spendingDataArray,
  //   angleField: "value",
  //   colorField: "category",
  // };


  const showExpenseModal = () => {
    setIsExpenseModalVisible(true);
  };

  const showIncomeModal = () => {
    setIsIncomeModalVisible(true);
  };

  const handleExpenseCancel = () => {
    setIsExpenseModalVisible(false);
  };

  const handleIncomeCancel = () => {
    setIsIncomeModalVisible(false);
  };

 

  // data come from when submit the form..
  const onFinish = (values, type) => {
    const newTransaction = {
      type: type,
      //values.date.format("YYYY-MM-DD") -- alternative..
      date: moment(values.date).format("YYYY-MM-DD"),//moment(values.date): moment is a function provided by the Moment.js library. It is used to parse, manipulate, and format dates in JavaScript. Here, values.date refers to the value of the form field named "date", which is assumed to be a date object or a string representation of a date.
                                                     //.format("YYYY-MM-DD"): The format method in Moment.js allows you to specify the output format of the date. "YYYY-MM-DD" specifies that the date should be formatted as a string in the format "YYYY-MM-DD", which represents the year, month, and day of the month in a specific order.
      amount: parseFloat(values.amount),
      tag: values.tag,
      name: values.name,
    };

    setTransactions([...transactions, newTransaction]);
    setIsExpenseModalVisible(false);
    setIsIncomeModalVisible(false);
    addTransaction(newTransaction);
    calculateBalance();
  };

  const calculateBalance = () => {
    let incomeTotal = 0;
    let expensesTotal = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        incomeTotal += transaction.amount;
      } else {
        expensesTotal += transaction.amount;
      }
    });
 
    setIncome(incomeTotal);
    setExpenses(expensesTotal);
    setCurrentBalance(incomeTotal - expensesTotal);
  };

  // Calculate the initial balance, income, and expenses
  useEffect(() => {
    calculateBalance();
  }, [transactions]);

  // here adding transacton-collection in firebase
  async function addTransaction(transaction,many) {
    try {
      const docRef = await addDoc(
        collection(db, `users/${user.uid}/transactions`),
        transaction
      );
      console.log("Document written with ID: ", docRef.id);
      if(!many)toast.success("Transaction Added!");// Show success notification if not adding many transactions
    } catch (e) {
      console.error("Error adding document: ", e);
      if(!many)toast.error("Couldn't add transaction");
    }
  }

  // fetching tranction from DB--------- 
  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    setLoading(true);
    if (user) {
      const q = query(collection(db, `users/${user.uid}/transactions`));
      const querySnapshott = await getDocs(q);
      let transactionsArray = [];
      querySnapshott.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        transactionsArray.push(doc.data());
        
      });
      setTransactions(transactionsArray);
      toast.success("Transactions Fetched!");
    }
    setLoading(false);
  }

  
  function reset() {
    setIncome(0);
    setExpenses(0);
    setCurrentBalance(0);
    console.log("resetting");
  }
  const cardStyle = {
    boxShadow: "0px 0px 30px 8px rgba(227, 227, 227, 0.75)",
    margin: "2rem",
    borderRadius: "0.5rem",
    minWidth: "400px",//
    flex: 1,// according to screen size cards grows
  };

  function exportToCsv() {
    
    const csv = unparse(transactions, {// Convert transactions array to CSV string using PapaParse or similar library
      fields: ["name", "type", "date", "amount", "tag"],
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });// Create a Blob from the CSV string
    const url = URL.createObjectURL(blob);// Create a temporary URL for the Blob
    // Create an anchor element and trigger a download
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="dashboard-container">
      <Header />
      {loading ? (
  <Loader />
      ) : (
        <>
          <Cards
            currentBalance={currentBalance}
            income={income}
            expenses={expenses}
            showExpenseModal={showExpenseModal}
            showIncomeModal={showIncomeModal}
            cardStyle={cardStyle}
            reset={reset}
          />

          <AddExpenseModal
            isExpenseModalVisible={isExpenseModalVisible}
            handleExpenseCancel={handleExpenseCancel}
            onFinish={onFinish}
          />
          <AddIncomeModal
            isIncomeModalVisible={isIncomeModalVisible}
            handleIncomeCancel={handleIncomeCancel}
            onFinish={onFinish}
          />
          {transactions.length === 0 ? (
            <NoTransactions />
          ) : (
            <>
              <Row gutter={16}>
                <Card bordered={true} style={cardStyle}>
                  <h2>Financial Statistics</h2>
                  {/* <Line {...balanceConfig} /> */}
                   <Line data={balanceData} xField="newMonthYear" yField="balance"/> 
                </Card>

                <Card bordered={true} style={{ ...cardStyle, flex: 0.45 }}>
                  <h2>Total Spending</h2>
                  {spendingDataArray.length == 0 ? (
                    <p>Seems like you haven't spent anything till now...</p>
                  ) : (
                    // <Pie {...spendingConfig} />
                    <Pie  data={spendingDataArray}  angleField= "value" colorField= "category" />
                  )}
                </Card>
              </Row>
            </>
          )}
          <TransactionSearch
            transactions={transactions}
            exportToCsv={exportToCsv}
            fetchTransactions={fetchTransactions}
            addTransaction={addTransaction}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
