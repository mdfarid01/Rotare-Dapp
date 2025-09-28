import { useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { MEMBER_ACCOUNT_MANAGER_ADDRESS, MEMBER_ACCOUNT_MANAGER_ABI } from "@/lib/contracts/memberAccountManager";

function formatTimestamp(ts: number) {
  if (!ts) return "-";
  const date = new Date(ts * 1000);
  return date.toLocaleString();
}

export default function UserProfile() {
  const { address, isConnected } = useAccount();
  const [userAddress, setUserAddress] = useState("");

  // Use connected wallet or input address
  const activeAddress = isConnected ? address : userAddress;

  const { data, isLoading, error } = useContractRead({
    address: MEMBER_ACCOUNT_MANAGER_ADDRESS,
    abi: MEMBER_ACCOUNT_MANAGER_ABI,
    functionName: "getMemberProfile",
    args: [activeAddress],
    enabled: !!activeAddress,
    watch: true,
  });

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      {!isConnected && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter user address"
            value={userAddress}
            onChange={e => setUserAddress(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          />
        </div>
      )}
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-500">Error: {error.message}</div>}
      {data && (
        <div className="space-y-2">
          <div><strong>Address:</strong> {activeAddress}</div>
          <div><strong>Registered:</strong> {data[0] ? "Yes" : "No"}</div>
          <div><strong>Total Cycles Participated:</strong> {data[1]?.toString()}</div>
          <div><strong>Total Cycles Won:</strong> {data[2]?.toString()}</div>
          <div><strong>Total Contribution:</strong> {data[3]?.toString()}</div>
          <div><strong>Reputation Score:</strong> {data[4]?.toString()}</div>
          <div><strong>Last Joined:</strong> {formatTimestamp(Number(data[5]))}</div>
          <div><strong>Created Pots:</strong> {data[6]?.length ? data[6].join(", ") : "-"}</div>
          <div><strong>Joined Pots:</strong> {data[7]?.length ? data[7].join(", ") : "-"}</div>
        </div>
      )}
    </div>
  );
}
