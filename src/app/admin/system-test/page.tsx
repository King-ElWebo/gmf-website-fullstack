"use client";

import React, { useState, useEffect } from "react";

export default function SystemTestPage() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    zip: "",
    city: ""
  });
  
  const [requestPayload, setRequestPayload] = useState<any>(null);
  const [responsePayload, setResponsePayload] = useState<any>(null);
  const [createdBookingId, setCreatedBookingId] = useState<string>("");
  
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Lade Items aus dem System
    fetch("/api/admin/items")
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          setItems(data.items);
          if (data.items.length > 0) {
            setSelectedItemId(data.items[0].id);
          }
        }
      })
      .catch(console.error);

    // Default Daten setzen
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 2);
    setStartDate(today.toISOString().split("T")[0] + "T10:00");
    setEndDate(future.toISOString().split("T")[0] + "T18:00");
  }, []);

  const handleFillTestCustomer = () => {
    setCustomer({
      firstName: "Max",
      lastName: "Mustermann",
      email: "test@example.com",
      phone: "+49123456789",
      addressLine1: "Teststraße 1",
      zip: "12345",
      city: "Teststadt"
    });
  };

  const handleSendTestRequest = async () => {
    setErrorMsg("");
    setResponsePayload(null);
    setCreatedBookingId("");
    setBookingDetails(null);

    if (!selectedItemId) {
        setErrorMsg("Bitte erst ein Item auswählen.");
        return;
    }

    const payload = {
      customer,
      items: [{ resourceId: selectedItemId, quantity: Number(quantity) }],
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      deliveryType: "pickup",
      customerMessage: "System Test Booking"
    };

    setRequestPayload(payload);

    try {
      const res = await fetch("/api/public/bookings/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setResponsePayload(data);

      if (data.success && data.bookingId) {
        setCreatedBookingId(data.bookingId);
        fetchBookingDetails(data.bookingId);
      } else {
        setErrorMsg(data.error || "Unbekannter Fehler beim Request");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const fetchBookingDetails = async (id: string = createdBookingId) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/admin/bookings/${id}`);
      const data = await res.json();
      setBookingDetails(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleStatusAction = async (action: string) => {
    if (!createdBookingId) return;
    try {
      // Nutze die Status Override API (bzw. spezifische Action Endpoints, aber aus Einfachheitsgründen den fallback-status endpoint)
      const res = await fetch(`/api/admin/bookings/${createdBookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action })
      });
      const data = await res.json();
      if (!res.ok) {
        alert("Error: " + (data.error || "Unbekannt"));
      } else {
        alert("Erfolg: " + data.message);
        fetchBookingDetails(); // reload
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col gap-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Test Setup (Booking & Email)</h1>
        <button 
          onClick={() => window.location.reload()}
          className="bg-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300"
        >
          Reset Page
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LINKS: INPUT FORM */}
        <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">1. Booking Konfigurieren</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Seed Item (Resource)</label>
            <select 
              className="w-full border p-2 rounded" 
              value={selectedItemId}
              onChange={e => setSelectedItemId(e.target.value)}
            >
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.title} (Stock: {item.totalStock}) - {item.id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input 
                type="number" min="1" className="w-full border p-2 rounded"
                value={quantity} onChange={e => setQuantity(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input 
                type="datetime-local" className="w-full border p-2 rounded"
                value={startDate} onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input 
                type="datetime-local" className="w-full border p-2 rounded"
                value={endDate} onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Test Kunde</h3>
              <button 
                onClick={handleFillTestCustomer}
                className="text-xs bg-blue-600 outline outline-1 outline-blue-600 text-white rounded hover:bg-blue-700 px-2 py-1"
              >
                 Testdaten füllen
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <input placeholder="Vorname" className="border p-2 rounded" value={customer.firstName} onChange={e=>setCustomer({...customer, firstName: e.target.value})} />
              <input placeholder="Nachname" className="border p-2 rounded" value={customer.lastName} onChange={e=>setCustomer({...customer, lastName: e.target.value})} />
              <input placeholder="Email" className="border p-2 rounded" value={customer.email} onChange={e=>setCustomer({...customer, email: e.target.value})} />
              <input placeholder="Telefon" className="border p-2 rounded" value={customer.phone} onChange={e=>setCustomer({...customer, phone: e.target.value})} />
            </div>
          </div>

          <button 
            onClick={handleSendTestRequest}
            className="w-full bg-green-600 text-white font-bold text-lg p-3 rounded hover:bg-green-700 mt-2"
          >
            TEST Request Absenden 🚀
          </button>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 border-l-4 border-red-500 text-sm">
              Fehler: {errorMsg}
            </div>
          )}
        </div>

        {/* RECHTS: RESPONSE & ADMIN VIEW */}
        <div className="flex flex-col gap-6">
          
          {/* Payload / Response Debugging */}
          <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-200">
            <h2 className="text-sm font-semibold mb-2 uppercase text-gray-500">2. Request / Response</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold block mb-1">Payload:</span>
                <pre className="text-[10px] bg-gray-900 text-green-400 p-2 rounded overflow-auto max-h-40">
                  {requestPayload ? JSON.stringify(requestPayload, null, 2) : "Warte auf Request..."}
                </pre>
              </div>
              <div>
                <span className="text-xs font-bold block mb-1">Response:</span>
                <pre className="text-[10px] bg-gray-900 text-blue-400 p-2 rounded overflow-auto max-h-40">
                  {responsePayload ? JSON.stringify(responsePayload, null, 2) : "Warte auf Response..."}
                </pre>
              </div>
            </div>
          </div>

          {/* Admin Aktionen */}
          {createdBookingId && bookingDetails && (
            <div className="bg-white p-6 shadow-sm rounded-lg border-2 border-green-500">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold">3. Status Dashboard</h2>
                 <button onClick={() => fetchBookingDetails()} className="text-sm underline text-blue-600">Aktualisieren 🔄</button>
              </div>
              
              <div className="flex gap-4 items-center mb-6">
                 <div>
                    <span className="text-xs text-gray-500 uppercase block">Booking ID</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 object-contain rounded select-all">{createdBookingId}</span>
                 </div>
                 <div>
                    <span className="text-xs text-gray-500 uppercase block">Aktueller Status</span>
                    <span className={`px-2 py-1 text-sm font-bold uppercase rounded ${
                      bookingDetails.status === 'approved' ? 'bg-green-100 text-green-800' :
                      bookingDetails.status === 'rejected' || bookingDetails.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bookingDetails.status}
                    </span>
                 </div>
                 
                 <a 
                    href={`/admin/bookings/${createdBookingId}`}
                    target="_blank" rel="noreferrer"
                    className="ml-auto text-sm text-blue-600 font-medium hover:underline bg-blue-50 px-3 py-1 rounded"
                 >
                    im Admin öffnen ↗
                 </a>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded border">
                 <h3 className="text-sm font-bold uppercase mb-3">Quick Actions (Status Override)</h3>
                 <div className="flex gap-2">
                    <button onClick={() => handleStatusAction("approved")} className="bg-green-600 text-white text-sm px-4 py-2 rounded shadow">Approve 🟢</button>
                    <button onClick={() => handleStatusAction("rejected")} className="bg-red-600 text-white text-sm px-4 py-2 rounded shadow">Reject 🔴</button>
                    <button onClick={() => handleStatusAction("cancelled")} className="bg-orange-600 text-white text-sm px-4 py-2 rounded shadow">Cancel 🟠</button>
                    <button onClick={() => handleStatusAction("completed")} className="bg-blue-600 text-white text-sm px-4 py-2 rounded shadow">Complete 🔵</button>
                 </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase mb-2 border-b pb-1">4. System Logs (Emails & Notes)</h3>
                
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-gray-600 mb-1">Email Logs ({bookingDetails.emailLogs?.length || 0})</h4>
                  {bookingDetails.emailLogs && bookingDetails.emailLogs.length > 0 ? (
                    <ul className="space-y-2">
                      {bookingDetails.emailLogs.map((log: any, idx: number) => (
                        <li key={idx} className="text-xs p-2 bg-gray-50 rounded border flex flex-col">
                          <div className="flex justify-between font-mono">
                            <span>Typ: <b>{log.templateType || 'Unbekannt'}</b></span>
                            <span className={log.status === 'success' ? 'text-green-600' : 'text-red-500'}>Status: {log.status}</span>
                          </div>
                          {log.errorText && <div className="text-red-600 mt-1">Error: {log.errorText}</div>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-gray-400 italic">Noch keine E-Mails generiert.</div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-600 mb-1">Internal Notes ({bookingDetails.notes?.length || 0})</h4>
                  {bookingDetails.notes && bookingDetails.notes.length > 0 ? (
                    <ul className="space-y-1">
                      {bookingDetails.notes.map((note: any, idx: number) => (
                        <li key={idx} className="text-[10px] p-2 bg-yellow-50 rounded border-l-2 border-yellow-400">
                          {note.content} <span className="text-gray-400">({new Date(note.createdAt).toLocaleString()})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-gray-400 italic">Keine internen Notizen.</div>
                  )}
                </div>

              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
