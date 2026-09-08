import React from 'react';

interface Product {
    id: string;
    name: string;
    price: number;
    sold: number;
    stock: number;
    image: string;
}

interface TopProductsTableProps {
    products: Product[];
}

const TopProductsTable: React.FC<TopProductsTableProps> = ({ products }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Top sản phẩm bán chạy</h3>
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-500 font-medium">
                            <th className="pb-3 pl-2">Sản phẩm</th>
                            <th className="pb-3 text-right">Giá</th>
                            <th className="pb-3 text-right">Đã bán</th>
                            <th className="pb-3 px-4 w-1/4">Tồn kho</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="py-3 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="font-medium text-gray-700 truncate max-w-[150px] lg:max-w-[200px]" title={product.name}>
                                        {product.name}
                                    </span>
                                </td>
                                <td className="text-right py-3 text-gray-600 font-medium">
                                    {product.price.toLocaleString('vi-VN')} ₫
                                </td>
                                <td className="text-right py-3 text-gray-800 font-bold">
                                    {product.sold}
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${product.stock < 20 ? 'bg-red-500' : 'bg-blue-500'}`}
                                                style={{ width: `${Math.min(product.stock, 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500 w-6 text-right">{product.stock}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopProductsTable;
