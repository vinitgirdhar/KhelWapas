
'use client';

import { KhelwapasLogo } from "@/components/icons/khelwapas-logo";
import { type Order } from "@/types/user";
// Product data will be fetched from API if needed
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import '../../invoice-print.css';

// Mock function to get order details. In a real app, this would be an API call.
const getOrderDetails = (orderId: string) => {
    // For this prototype, we'll use a mix of mock data.
    // The order ID itself is generated on the success page, so we can't look it up directly.
    // We'll just use placeholder data for now
    const order = {
        id: 'ORD001',
        orderNumber: 'ORD001',
        date: new Date().toLocaleDateString('en-GB'),
        status: 'delivered',
        total: 2500
    };
    const products = [
        {
            id: 'prod1',
            name: 'Sample Product 1',
            category: 'Cricket',
            type: 'preowned',
            price: 1200,
            quantity: 1
        },
        {
            id: 'prod2',
            name: 'Sample Product 2',
            category: 'Football',
            type: 'new',
            price: 800,
            quantity: 1
        }
    ];
    const subtotal = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    return {
        ...order,
        id: orderId,
        items: products,
        subtotal,
        gst,
        total,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        client: {
            name: "Mr. Rahul Sharma",
            company: "Skyline Enterprises Pvt. Ltd.",
            address: "5th Floor, Oceanic Tower, Veera Desai Road,\nAndheri West, Mumbai – 400058, India",
            phone: "+91 91234 56789",
            email: "rahul.sharma@skyline.com"
        }
    };
};

export default function InvoicePage() {
    const params = useParams();
    const orderId = typeof params.orderId === 'string' ? params.orderId : '';
    const order = getOrderDetails(orderId);

    const handlePrint = () => {
        window.print();
    };

    if (!order) {
        return <div>Order not found</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-8" id="invoice-page">
            <div className="max-w-4xl mx-auto bg-white shadow-lg p-8 sm:p-12">
                 <header className="flex justify-between items-start mb-12">
                    <div className="flex items-center gap-4">
                        <KhelwapasLogo className="h-16 w-16" />
                        <div>
                            <h1 className="text-2xl font-bold font-headline text-primary">KHELWAPAS</h1>
                            <p className="text-sm text-gray-500 max-w-xs">
                                Flat No. 302, Sunrise Apartments, JP Road, Andheri West,
                                Mumbai, Maharashtra – 400053, India
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Phone: +91 98765 43210</p>
                        <p className="text-sm text-gray-500">Email: support@khelwapas.com</p>
                        <p className="text-sm text-gray-500">GSTIN: 27ABCDE1234F1Z5</p>
                    </div>
                </header>

                <div className="grid sm:grid-cols-2 gap-8 mb-12">
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Bill To:</h3>
                        <p className="font-bold">{order.client.name}</p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{order.client.address}</p>
                        <p className="text-sm text-gray-600">Phone: {order.client.phone}</p>
                        <p className="text-sm text-gray-600">Email: {order.client.email}</p>
                    </div>
                    <div className="text-right">
                         <h2 className="text-2xl font-bold text-gray-800 mb-2">Invoice</h2>
                        <p className="text-sm text-gray-600"><strong>Invoice No:</strong> {order.id.replace('ORD', 'INV')}</p>
                        <p className="text-sm text-gray-600"><strong>Date:</strong> {order.date}</p>
                        <p className="text-sm text-gray-600"><strong>Due Date:</strong> {order.dueDate}</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 font-semibold text-gray-600">Sr. No.</th>
                                <th className="p-3 font-semibold text-gray-600">Description</th>
                                <th className="p-3 font-semibold text-gray-600 text-center">Quantity</th>
                                <th className="p-3 font-semibold text-gray-600 text-right">Unit Price (₹)</th>
                                <th className="p-3 font-semibold text-gray-600 text-right">Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, index) => (
                                <tr key={item.id} className="border-b">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.category} - {item.type}</p>
                                    </td>
                                    <td className="p-3 text-center">{item.quantity}</td>
                                    <td className="p-3 text-right">{item.price.toFixed(2)}</td>
                                    <td className="p-3 text-right font-medium">{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mt-8">
                    <div className="w-full sm:w-1/2 lg:w-1/3 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">₹{order.subtotal.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-gray-600">GST @ 18%</span>
                            <span className="font-medium">₹{order.gst.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between border-t-2 pt-2 mt-2">
                            <span className="font-bold text-lg">Grand Total</span>
                            <span className="font-bold text-lg">₹{order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t pt-8">
                    <h3 className="font-semibold text-gray-700 mb-2">Payment Instructions</h3>
                    <div className="text-xs text-gray-600 bg-gray-50 p-4 rounded-lg">
                        <p><strong>Bank Name:</strong> HDFC Bank</p>
                        <p><strong>Account Name:</strong> KHELWAPAS</p>
                        <p><strong>Account Number:</strong> 50100234567890</p>
                        <p><strong>IFSC Code:</strong> HDFC0001234</p>
                        <p><strong>UPI ID:</strong> khelwapas@hdfcbank</p>
                    </div>
                </div>

                 <div className="mt-8 text-xs text-gray-500">
                    <h3 className="font-semibold text-gray-700 mb-2">Terms & Conditions</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Payment due within 7 days from the invoice date.</li>
                        <li>Late payments will incur an interest of 1.5% per month.</li>
                        <li>Goods once delivered will not be returned unless defective.</li>
                        <li>All disputes subject to Mumbai jurisdiction.</li>
                    </ul>
                </div>
                 <div className="mt-16 text-center text-sm text-gray-500">
                    <p>Thank you for your business!</p>
                    <p><strong>KHELWAPAS – Mumbai</strong></p>
                </div>
            </div>
             <div className="max-w-4xl mx-auto mt-6 text-center no-print">
                <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print or Save as PDF
                </Button>
            </div>
        </div>
    );
}
