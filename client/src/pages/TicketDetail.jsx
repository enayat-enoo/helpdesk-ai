import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import Nav from "../components/Nav";

export default function TicketDetail(){
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [reply, setReply] = useState("");

  useEffect(()=> { fetch(); }, [id]);

  async function fetch(){
    try {
      const res = await api.get(`/tickets/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function sendReply(){
    await api.post(`/tickets/${id}/reply`, { message: reply, close: true });
    setReply("");
    fetch();
  }

  if (!data) return <div>Loading...</div>;
  const { ticket, suggestion, audit } = data;

  return (
    <>
      <Nav/>
      <div className="p-6">
        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="text-2xl">{ticket.title}</h2>
          <div className="text-sm text-gray-600">Status: {ticket.status}</div>
          <p className="mt-2">{ticket.description}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="bg-white p-4 rounded shadow mb-4">
              <h3 className="text-lg">Agent Suggestion</h3>
              {suggestion ? (
                <>
                  <div className="text-sm text-gray-600">Predicted: {suggestion.predictedCategory} • Conf: {suggestion.confidence}</div>
                  <pre className="bg-gray-50 p-3 mt-2 whitespace-pre-wrap">{suggestion.draftReply}</pre>
                </>
              ) : <div>No suggestion yet.</div>}
              <div className="mt-2">
                <textarea className="w-full border p-2" placeholder="Edit reply..." value={reply} onChange={e=>setReply(e.target.value)} />
                <button onClick={sendReply} className="bg-green-600 text-white p-2 rounded mt-2">Send & Close</button>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg">Audit Timeline</h3>
              <div className="space-y-2 mt-2">
                {audit.map(a => (
                  <div key={a._id} className="text-sm border-l-2 pl-3">
                    <div className="text-xs text-gray-500">{new Date(a.timestamp).toLocaleString()} • {a.actor}</div>
                    <div>{a.action} {a.meta && `— ${JSON.stringify(a.meta)}`}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg">KB Articles</h3>
            <ul className="mt-2">
              {(suggestion?.articleIds || []).map(id => <ArticleItem key={id} id={id} />)}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

function ArticleItem({ id }) {
  const [a, setA] = useState(null);
  useEffect(()=> {
    api.get(`/kb`).then(res => {
      const found = res.data.find(x => x._id === id);
      setA(found);
    }).catch(()=>setA(null));
  }, [id]);
  if (!a) return <li>loading...</li>;
  return <li className="mb-2">
    <div className="font-semibold">{a.title}</div>
    <div className="text-sm text-gray-600">{a.body.slice(0,120)}...</div>
  </li>;
}
