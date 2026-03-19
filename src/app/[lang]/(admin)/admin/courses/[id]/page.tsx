'use client';
import React from 'react';
import Image from 'next/image';
import { Button, Tag, Typography, Rate } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { coursesData } from '@/utils/courseData';
import { useParams, useRouter } from 'next/navigation';

const { Title, Text, Paragraph } = Typography;

const CourseDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const { locale, id } = params as { locale: string; id: string };

    const course = coursesData.find(c => c.id === id);

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Title level={2}>Course Not Found</Title>
                    <Button type="primary" onClick={() => router.back()}>
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const getEmbedUrl = (url: string) => {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname.includes("youtube.com") && urlObj.searchParams.has("v")) {
                const videoId = urlObj.searchParams.get("v");
                return `https://www.youtube.com/embed/${videoId}`;
            }
            if (urlObj.hostname === "youtu.be") {
                const videoId = urlObj.pathname.slice(1);
                return `https://www.youtube.com/embed/${videoId}`;
            }
            return url;
        } catch {
            return url;
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Button 
                        type="text" 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => router.back()}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        Back to Courses
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Content - Course Details */}
                    <div className="lg:col-span-2">
                        {/* Course Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Tag color="blue">{course.courseRole}</Tag>
                                <Tag color="green">{course.specialization}</Tag>
                            </div>
                            <Title level={1} className="!mb-3 !text-3xl font-bold text-gray-900">
                                {course.title}
                            </Title>
                            <Text className="text-lg text-gray-600">
                                {course.shortDescription}
                            </Text>
                        </div>

                        {/* Course Preview */}
                        {(course.video || course.videoLink) && (
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <PlayCircleOutlined className="text-red-500" />
                                    <Text strong className="text-lg">Course Preview</Text>
                                </div>
                                {course.video && (
                                    <video controls className="w-full rounded-lg border">
                                        <source src={URL.createObjectURL(course.video)} type="video/mp4" />
                                    </video>
                                )}
                                {course.videoLink && (
                                    <div className="relative w-full pb-[56.25%] h-0 rounded-lg overflow-hidden border">
                                        <iframe
                                            src={getEmbedUrl(course.videoLink)}
                                            title="Course preview"
                                            className="absolute top-0 left-0 w-full h-full"
                                            allowFullScreen
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Course Description */}
                        <div className="mb-8">
                            <Title level={3} className="!mb-4">About This Course</Title>
                            <div 
                                className="prose prose-lg max-w-none text-gray-700"
                                dangerouslySetInnerHTML={{ __html: course.description }} 
                            />
                        </div>

                        {/* What You'll Learn */}
                        <div className="border-t pt-8">
                            <Title level={3} className="!mb-6">What You'll Learn</Title>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircleOutlined className="text-green-500 mt-1" />
                                    <Text>Comprehensive understanding of {course.specialization}</Text>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircleOutlined className="text-green-500 mt-1" />
                                    <Text>Practical skills and techniques</Text>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircleOutlined className="text-green-500 mt-1" />
                                    <Text>Industry best practices</Text>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircleOutlined className="text-green-500 mt-1" />
                                    <Text>Real-world case studies</Text>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Pricing & Info */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 border rounded-lg shadow-sm">
                            {/* Course Image */}
                            {course.banner && (
                                <div className="w-full h-48 overflow-hidden rounded-t-lg">
                                    <Image 
                                        src={typeof course.banner === 'string' ? course.banner : URL.createObjectURL(course.banner)}
                                        alt="Course banner"
                                        width={400}
                                        height={200}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Pricing */}
                            <div className="p-6 border-b">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <Title level={2} className="!m-0 !text-3xl text-gray-900">
                                        AED {course.price.toFixed(2)}
                                    </Title>
                                </div>
                                <Button type="primary" size="large" block className="h-12 mb-3 font-semibold">
                                    Enroll Now
                                </Button>
                                <Button size="large" block className="h-12 font-medium">
                                    Add to Wishlist
                                </Button>
                            </div>

                            {/* Course Includes */}
                            <div className="p-6 border-b">
                                <Text strong className="block mb-3">This course includes:</Text>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <Text>{course.expiryDays} days full access</Text>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <Text>Certificate of completion</Text>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <Text>Downloadable resources</Text>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <Text>Mobile and TV access</Text>
                                    </div>
                                </div>
                            </div>

                            {/* Course Details */}
                            <div className="p-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <UserOutlined className="text-gray-400" />
                                        <div>
                                            <Text strong className="block">Instructor</Text>
                                            <Text className="text-gray-600">{course.author}</Text>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <ClockCircleOutlined className="text-gray-400" />
                                        <div>
                                            <Text strong className="block">Duration</Text>
                                            <Text className="text-gray-600">{course.expiryDays} days access</Text>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <div>
                                            <Text strong className="block">Last updated</Text>
                                            <Text className="text-gray-600">{course.publishedDate}</Text>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;