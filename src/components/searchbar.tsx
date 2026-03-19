'use client';
import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const SearchBar: React.FC = () => {
    const [barValue, setBarValue] = useState<string>('');
    const router = useRouter();

    const update = (e: ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
        setBarValue(e.target.value);
    };

    const searchPressed = (value: string): void => {
        if (value.trim()) {
            router.push(`/?filter=${encodeURIComponent(value)}`);
        } else {
            router.push('/');
        }
    };

    const handleSearch = (): void => {
        searchPressed(barValue);
    };

    const keySearch = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchPressed(barValue);
        }
    };

    return (
        <li className="hidden lg:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
                <Input
                    size="large"
                    placeholder="Search for anything"
                    value={barValue}
                    onChange={update}
                    onKeyDown={keySearch}
                    prefix={<SearchOutlined className="text-gray-400" />}
                    className="w-full rounded-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <Button 
                    type="primary" 
                    icon={<SearchOutlined />}
                    onClick={handleSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                    size="middle"
                >
                    Search
                </Button>
            </div>
        </li>
    );
};

export default SearchBar;