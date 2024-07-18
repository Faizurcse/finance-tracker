import React from "react";
import { Card, Row } from "antd";

function Cards({
  currentBalance,
  income,
  expenses,
  showExpenseModal,
  showIncomeModal,
  cardStyle,
  reset,
}) {
  return (
    <Row
      style={{
        display: "flex",
        flexWrap: "wrap",// The default value is nowrap, which keeps the items in a single line. Setting it to wrap allows the items to wrap onto multiple lines when necessary.
        gap: "16px",//shorthand for setting both row-gap and column-gap
        justifyContent: "space-between",
      }}
    >
      {/* >>bordered={true} enables the border around the card. By default, a card may 
      not have a border, and setting this property to true ensures that a border is displayed.

          >>style={cardStyle}This property applies custom CSS styles to the Card component.
       */}
      <Card bordered={true}  style={cardStyle}>
        <h2>Current Balance</h2>
        <p>₹{currentBalance}</p>
        <div className="btn btn-blue" style={{ margin: 0 }} onClick={reset}>
          Reset Balance
        </div>
      </Card>

      <Card bordered={true} style={cardStyle}>
        <h2>Total Income</h2>
        <p>₹{income}</p>
        <div
          className="btn btn-blue"
          style={{ margin: 0 }}
          onClick={showIncomeModal}
        >
          Add Income
        </div>
      </Card>

      <Card bordered={true} style={cardStyle}>
        <h2>Total Expenses</h2>
        <p>₹{expenses}</p>
        <div className="btn btn-blue" onClick={showExpenseModal}>
          Add Expense
        </div>
      </Card>
    </Row>
  );
}

export default Cards;
