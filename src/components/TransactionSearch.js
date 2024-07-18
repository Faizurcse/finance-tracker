import React, { useRef, useState } from "react";
import { Input, Table, Select, Radio } from "antd";
// import { SearchOutlined } from "@ant-design/icons";
import search from "../assets/search.svg";
import { parse } from "papaparse";
import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
 //const { Search } = Input;
const { Option } = Select;

const TransactionSearch = ({
  transactions,
  exportToCsv,
  addTransaction,
  fetchTransactions,
}) => {
 
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortKey, setSortKey] = useState("");
  const fileInput = useRef();

  
   //This function takes an event parameter, which is the event object from the file input change event.
   async function importFromCsv(event) {
    // event.preventDefault();//This prevents the default form submission behavior, which isn't needed here.
    try {
      parse(event.target.files[0], { //This uses the parse function from papaparse to read and parse the CSV file. event.target.files[0] gets the selected file from the file input element.
        header: true,//header: true indicates that the CSV file has a header row, which should be used as the keys for the resulting objects.
        complete: async function (results) {//complete is a callback function that runs when the parsing is done. It receives the results object, which contains the parsed data.
         // console.log("results>>>", results);
          // Now results.data is an array of objects representing your CSV rows
          
          for (const transaction of results.data) {// data is array object in the result object
            // Write each transaction to Firebase, you can use the addTransaction function here
            // console.log("Transactions", transaction);
            const newTransaction = {
              ...transaction,
              amount: parseFloat(transaction.amount),//It creates a new transaction object, converting the amount field from a string to an integer.
            };
            await addTransaction(newTransaction, true); //It uses the addTransaction function to add the new transaction to Firebase.
          }
        },
      });
      toast.success("All Transactions Added");
      fetchTransactions();
      event.target.files = null;
    } catch (e) {
      toast.error(e.message);
    }
  }

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Tag",
      dataIndex: "tag",
      key: "tag",
    },
  ];

  

  const filteredTransactions = transactions.filter((transaction) => {
    const searchMatch = searchTerm
      ? transaction.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const tagMatch = selectedTag ? transaction.tag === selectedTag : true;
    const typeMatch = typeFilter ? transaction.type === typeFilter : true;

    return searchMatch && tagMatch && typeMatch;
  });

 

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortKey === "date") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortKey === "amount") {
      return a.amount - b.amount;
    } else {
      return 0;
    }
  });

  // tabale data rendering
  const dataSource = sortedTransactions.map((transaction, index) => ({
    key: index,
    ...transaction,
  }));
  // console.log(' dataSource',  dataSource);

  return (
    <div
      style={{
        width: "100%",
        padding: "0rem 2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div className="input-flex">
          <img src={search} width="16" />
          <Input
            placeholder="Search by Name"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          className="select-input"
          onChange={(value) => setTypeFilter(value)}
          value={typeFilter}
          placeholder="Filter"
          allowClear
        >
          <Option value="">All</Option>
          <Option value="income">Income</Option>
          <Option value="expense">Expense</Option>
        </Select>
      </div>

      <div className="my-table">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            marginBottom: "1rem",
          }}
        >
          <h2>My Transactions</h2>

          <Radio.Group
            className="input-radio"
            onChange={(e) => setSortKey(e.target.value)}
            value={sortKey}
          >
            <Radio.Button value="">No Sort</Radio.Button>
            <Radio.Button value="date">Sort by Date</Radio.Button>
            <Radio.Button value="amount">Sort by Amount</Radio.Button>
          </Radio.Group>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              width: "400px",
            }}
          >
            <button className="btn" onClick={exportToCsv}>
              Export to CSV
            </button>
            <label for="file-csv" className="btn btn-blue">
              Import from CSV
            </label>
            <input
              onChange={importFromCsv}
              id="file-csv"
              type="file"
              accept=".csv"
              required
              style={{ display: "none" }}
            />
          </div>
        </div>

{/* passing as props in tale columns={columns} dataSource={dataSource} */}
        <Table columns={columns} dataSource={dataSource} /> 
      </div>
    </div>
  );
};

export default TransactionSearch;
