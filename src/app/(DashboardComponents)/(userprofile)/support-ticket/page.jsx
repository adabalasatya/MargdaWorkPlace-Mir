'use client';

import React, { useState } from "react";
import Link from "next/link";

// Mock data for the table
const tickets = [
  // {
  //   id: 1,
  //   date: "2023-10-01",
  //   ticket: "T12345",
  //   service: "Technical Support",
  //   subject: "Login Issue",
  //   details: "Unable to log in to the account.",
  //   status: "Open",
  //   action: "C-client",
  // },
  // {
  //   id: 2,
  //   date: "2023-10-02",
  //   ticket: "T12346",
  //   service: "Billing",
  //   subject: "Invoice Discrepancy",
  //   details: "The invoice amount does not match the purchase.",
  //   status: "In Progress",
  //   action: "O-office",
  // },
  // Add more mock data as needed
];

// Support Ticket Form Component
const SupportTicketForm = () => {
  const [service, setService] = useState("");
  const [source, setSource] = useState("");
  const [subject, setSubject] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Support Ticket Submitted:", {
      service,
      source,
      subject,
      comment,
    });
    // Add your submission logic here (e.g., API call)
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white rounded-3xl shadow-lg border border-gray-200 mb-10">
      <h2 className="text-4xl font-bold text-gray-900 mb-10 text-center font-sans">
        Support Ticket Form
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Service Field */}
          <div className="md:col-span-3">
            <label
              htmlFor="service"
              className="block text-sm font-medium text-gray-700"
            >
              Service
            </label>
          </div>
          <div className="md:col-span-9">
            <div className="relative">
              <select
                id="service"
                name="service"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white bg-opacity-90"
                required
              >
                <option value="" disabled>
                  Select a service
                </option>
                <option value="Technical Support">Technical Support</option>
                <option value="Billing">Billing</option>
                <option value="Account Management">Account Management</option>
                <option value="Other">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Source Field */}
          <div className="md:col-span-3">
            <label
              htmlFor="source"
              className="block text-sm font-medium text-gray-700"
            >
              Source
            </label>
          </div>
          <div className="md:col-span-9">
            <div className="relative">
              <select
                id="source"
                name="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white bg-opacity-90"
                required
              >
                <option value="" disabled>
                  Select a source
                </option>
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="Web">Web</option>
                <option value="In-Person">In-Person</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Subject Field */}
          <div className="md:col-span-3">
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700"
            >
              Subject
            </label>
          </div>
          <div className="md:col-span-9">
            <input
              type="text"
              id="subject"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white bg-opacity-90"
              placeholder="Enter the subject"
              required
            />
          </div>

          {/* Comment Box */}
          <div className="md:col-span-3">
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700"
            >
              Comment
            </label>
          </div>
          <div className="md:col-span-9">
            <textarea
              id="comment"
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white bg-opacity-90"
              placeholder="Enter your comment"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-10">
          <button
            type="submit"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 active:scale-95 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

// Support Ticket Table Component
const SupportTicketTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Filter tickets based on search query
  const filteredTickets = tickets.filter((ticket) =>
    ticket.ticket.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredTickets.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white rounded-3xl shadow-lg border border-gray-200">
      <h2 className="text-4xl font-bold text-gray-900 mb-10 text-center font-sans">
        Support Ticket Table
      </h2>

      {/* Search Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-700">Show [10] records</div>
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 w-64"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border-2 border-gray-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-sm font-semibold text-gray-700 text-left">
                Date
              </th>
              <th className="p-3 text-sm font-semibold text-gray-700 text-left">
                Ticket
              </th>
              <th className="p-3 text-sm font-semibold text-gray-700 text-left">
                Service
              </th>
              <th className="p-3 text-sm font-semibold text-gray-700 text-left">
                Subject
              </th>
              <th className="p-3 text-sm font-semibold text-gray-700 text-left">
                Details
              </th>
              <th className="p-3 text-sm font-semibold text-gray-700 text-left">
                Status
              </th>
              <th className="p-3 text-sm font-semibold text-gray-700 text-left">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50 transition-all duration-200"
                >
                  <td className="p-3 text-sm text-gray-700">{ticket.date}</td>
                  <td className="p-3 text-sm text-gray-700">{ticket.ticket}</td>
                  <td className="p-3 text-sm text-gray-700">{ticket.service}</td>
                  <td className="p-3 text-sm text-gray-700">{ticket.subject}</td>
                  <td className="p-3 text-sm text-gray-700">{ticket.details}</td>
                  <td className="p-3 text-sm text-gray-700">{ticket.status}</td>
                  <td className="p-3 text-sm text-gray-700">{ticket.action}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  No support tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-700">
          Showing {currentRecords.length} of {filteredTickets.length} records
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastRecord >= filteredTickets.length}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const SupportTicket = () => {
  return (
    <div className="w-full min-h-screen p-6">
      <SupportTicketForm />
      <SupportTicketTable />
    </div>
  );
};

export default SupportTicket;
