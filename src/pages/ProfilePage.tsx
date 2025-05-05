import { useState } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConnectButton } from "@/components/WalletProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, FileKey, LockKeyhole, User, Wallet, Banknote, BanknoteIcon } from "lucide-react";

export function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    accountType: "checking",
  });

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the data to your backend
    console.log("Form submitted:", formData);
    alert("Profile information saved!");
  };

  // Handle bank account connection
  const connectBankAccount = () => {
    // In a real app, this would integrate with Plaid or similar services
    alert("In a production app, this would open a secure bank connection dialog.");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Your Profile</h1>
          <p className="mt-4 text-lg text-slate-600">
            Manage your personal information, connected wallets, and bank accounts
          </p>
        </div>

        {!isConnected ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <Wallet className="mb-4 h-12 w-12 text-slate-400" />
              <h2 className="mb-2 text-xl font-semibold">Connect Your Wallet</h2>
              <p className="mb-6 text-center text-slate-500">
                Please connect your wallet to access your profile and manage your accounts.
              </p>
              <ConnectButton />
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Personal Info</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="banking">Banking</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" /> Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <Button type="submit">Save Profile Information</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wallet">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" /> Wallet Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <FileKey className="h-5 w-5 text-slate-500" />
                      <h3 className="font-medium">Wallet Address</h3>
                    </div>
                    <p className="break-all text-sm font-mono p-2 bg-slate-100 rounded">{address}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-5 w-5 text-blue-500" />
                          <h3 className="font-medium">USDC Balance</h3>
                        </div>
                        <span className="text-lg font-bold">$0.00</span>
                      </div>
                      <Button variant="outline" className="w-full">Deposit USDC</Button>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-green-500" />
                          <h3 className="font-medium">Transaction History</h3>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">View Transactions</Button>
                    </div>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-4 text-blue-700">
                    <div className="flex items-center gap-2">
                      <LockKeyhole className="h-5 w-5" />
                      <p className="text-sm">Your wallet is securely connected. All transactions will be signed with your wallet.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="banking">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BanknoteIcon className="h-5 w-5" /> Banking Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="rounded-lg bg-slate-50 p-4">
                      <h3 className="mb-4 font-medium">Connect Your Bank Account</h3>
                      <p className="mb-4 text-sm text-slate-600">
                        Securely connect your bank account to deposit and withdraw funds easily.
                        All connections are encrypted and secure.
                      </p>
                      <Button onClick={connectBankAccount}>
                        Connect Bank Account
                      </Button>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h3 className="mb-4 font-medium">Manual Bank Account Entry</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="bankName">Bank Name</Label>
                          <Input
                            id="bankName"
                            value={formData.bankName}
                            onChange={(e) => handleInputChange("bankName", e.target.value)}
                            placeholder="Enter your bank name"
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="accountNumber">Account Number</Label>
                            <Input
                              id="accountNumber"
                              value={formData.accountNumber}
                              onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                              placeholder="Enter account number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="routingNumber">Routing Number</Label>
                            <Input
                              id="routingNumber"
                              value={formData.routingNumber}
                              onChange={(e) => handleInputChange("routingNumber", e.target.value)}
                              placeholder="Enter routing number"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accountType">Account Type</Label>
                          <Select
                            value={formData.accountType}
                            onValueChange={(value) => handleInputChange("accountType", value)}
                          >
                            <SelectTrigger id="accountType">
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="checking">Checking</SelectItem>
                              <SelectItem value="savings">Savings</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full">Save Bank Information</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
} 