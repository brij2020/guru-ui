"use client";

import { Carousel } from "antd";
import Image from "next/image";
import hero1 from "../../public/images/hero1.jpg";
import hero2 from "../../public/images/hero2.jpg";
import hero3 from "../../public/images/hero3.png";
import {
  MedicineBoxOutlined,
  WomanOutlined,
  // UserOutlined,
  // SkinOutlined,
  // SoundOutlined,
  // ExperimentOutlined,
  BranchesOutlined,
} from "@ant-design/icons";

type Lang = "en" | "hi";

interface HeroProps {
  dict: {
    hero: {
      title: string;
      highlight: string;
      subtitle: string;
      stats: { courses: string; count: string };
      trending: string;
      domains: {
        dentist: string;
        gynecologist: string;
        physician: string;
        dermatologist: string;
        ent: string;
        homoeopath: string;
        ayurveda: string;
      };
    };
  };
  lang: Lang;
}

export default function Hero({ dict, lang }: HeroProps) {
  const domains = [
    {
      icon: <MedicineBoxOutlined />,
      label: dict.hero.domains.dentist,
      color: "bg-yellow-100 text-yellow-700",
      link: "#dentist",
    },
    {
      icon: <WomanOutlined />,
      label: dict.hero.domains.gynecologist,
      color: "bg-green-100 text-green-700",
      link: "#gynecologist",
    },
    // {
    //   icon: <UserOutlined />,
    //   label: dict.hero.domains.physician,
    //   color: "bg-red-100 text-red-700",
    //   link: "#general-physician",
    // },
    // {
    //   icon: <SkinOutlined />,
    //   label: dict.hero.domains.dermatologist,
    //   color: "bg-purple-100 text-purple-700",
    //   link: "#dermatologist",
    // },
    // {
    //   icon: <SoundOutlined />,
    //   label: dict.hero.domains.ent,
    //   color: "bg-blue-100 text-blue-700",
    //   link: "#ent-specialist",
    // },
    // {
    //   icon: <ExperimentOutlined />,
    //   label: dict.hero.domains.homoeopath,
    //   color: "bg-orange-100 text-orange-700",
    //   link: "#homoeopath",
    // },
    {
      icon: <BranchesOutlined />,
      label: dict.hero.domains.ayurveda,
      color: "bg-orange-100 text-orange-700",
      link: "#ayurveda",
    },
  ];

  return (
    <>
      <section className="flex flex-col lg:flex-row items-center justify-center gap-10 px-6 md:px-12 lg:px-20 pt-12 bg-[var(--section-bg-2)] text-[var(--section-text)]">
        {/* Left Side */}
        <div className="flex-1 max-w-xl space-y-6 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            {dict.hero.title}{" "}
            <span className="text-[var(--section-primary)]">
              {dict.hero.highlight}
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {dict.hero.subtitle}
          </p>
          {/* Stats */}
          <div className="flex justify-center md:justify-start gap-8 mt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-[var(--section-primary)]">
                {dict.hero.stats.count}
              </h3>
              <p className="text-sm">{dict.hero.stats.courses}</p>
            </div>
          </div>
          {/* Trending Domains */}
          <section className="flex justify-center md:justify-start max-w-7xl mx-auto items-center pb-12">
            <div className="mt-10">
              <h3 className="text-lg font-semibold mb-4">
                {dict.hero.trending}
              </h3>
              <div className="flex flex-wrap gap-4 items-center">
                {domains.map((domain, idx) => (
                  <a href={domain.link} key={idx}>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 shadow-sm bg-white hover:shadow-md transition">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${domain.color}`}
                      >
                        {domain.icon}
                      </div>
                      <span className="text-sm font-medium">
                        {domain.label}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Side - Carousel */}
        <div className="flex-1 max-w-xl w-full">
          <Carousel autoplay infinite>
            <div>
              <Image
                src={hero1}
                alt="Hero Slide 1"
                width={800}
                height={500}
                className="rounded-xl object-cover w-full h-[350px] md:h-[400px] lg:h-[450px]"
                priority
              />
            </div>
            <div>
              <Image
                src={hero2}
                alt="Hero Slide 2"
                width={800}
                height={500}
                className="rounded-xl object-cover w-full h-[350px] md:h-[400px] lg:h-[450px]"
              />
            </div>
            <div>
              <Image
                src={hero3}
                alt="Hero Slide 3"
                width={800}
                height={500}
                className="rounded-xl object-cover w-full h-[350px] md:h-[400px] lg:h-[450px]"
              />
            </div>
          </Carousel>
        </div>
      </section>
    </>
  );
}
