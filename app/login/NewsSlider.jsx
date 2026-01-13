"use client";
/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import CampaignIcon from "@mui/icons-material/Campaign";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import { fetchNews } from "@/services/auth/Auth.services";
import { Carousel } from "@material-tailwind/react";

const NewsSlider = () => {
  const [news, setNews] = useState({
    importantAnnouncementNews: [],
    industryNews: [],
  });
  const [readMoreItem, setReadMoreItem] = useState(null);
  const [pause, setPause] = useState({ ann: false, ind: false });

  useEffect(() => {
    const run = async () => {
      try {
        const result = await fetchNews({ clientId: 4 });
        if (Array.isArray(result)) {
          const importantAnnouncementNews = result.filter(
            (x) => String(x?.flag || "").toLowerCase() === "t" // change to "i" if needed
          );
          const industryNews = result.filter(
            (x) => String(x?.flag || "").toLowerCase() === "n"
          );
          setNews({ importantAnnouncementNews, industryNews });
        }
      } catch (e) {
        console.error("fetchNews error:", e);
      }
    };
    run();
  }, []);

  const truncate = (content, maxWords) => {
    if (!content || typeof content !== "string") return "";
    const words = content.split(" ");
    return words.length > maxWords
      ? words.slice(0, maxWords).join(" ") + "..."
      : content;
  };

  const cards = useMemo(
    () => [
      {
        key: "ann",
        title: "Important Announcements",
        icon: <CampaignIcon fontSize="small" />,
        items: news.importantAnnouncementNews || [],
        paused: pause.ann,
        empty: "No announcements available.",
        badgeBg: "bg-blue-600",
        headerLine: "bg-blue-600/20",
      },
      {
        key: "ind",
        title: "Industry News",
        icon: <NewspaperIcon fontSize="small" />,
        items: news.industryNews || [],
        paused: pause.ind,
        empty: "No industry news available.",
        badgeBg: "bg-emerald-600",
        headerLine: "bg-emerald-600/20",
      },
    ],
    [news, pause]
  );

  return (
    <>
      {/* ✅ Readable design: solid white cards + subtle blur + strong text contrast */}
      <div className="w-full flex justify-center px-6">
        <div className="w-full max-w-6xl grid grid-cols-2 gap-5">
          {cards.map((c) => (
            <div
              key={c.key}
              onMouseEnter={() => setPause((p) => ({ ...p, [c.key]: true }))}
              onMouseLeave={() => setPause((p) => ({ ...p, [c.key]: false }))}
              className="
                rounded-2xl overflow-hidden
                border border-black/10
                bg-white/90
                shadow-[0_14px_40px_rgba(0,0,0,0.18)]
              "
            >
              {/* header (high contrast) */}
              <div className="px-5 py-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="
                        h-9 w-9 rounded-xl
                        bg-gray-100 border border-gray-200
                        flex items-center justify-center
                        text-gray-800
                      "
                    >
                      {c.icon}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-gray-900">
                        {c.title}
                      </p>
                      <div className={`h-[3px] w-24 rounded-full ${c.headerLine}`} />
                    </div>
                  </div>

                  {!!c.items?.length && (
                    <span
                      className={`
                        text-[11px] text-white
                        px-2.5 py-1 rounded-full
                        ${c.badgeBg}
                      `}
                    >
                      {c.items.length} item(s)
                    </span>
                  )}
                </div>
              </div>

              {/* body */}
              <div className="px-5 pb-5">
                {!c.items?.length ? (
                  <div className="text-[12px] text-gray-700 pt-3">
                    {c.empty}
                  </div>
                ) : (
                  <Carousel
                    autoplay={!c.paused}
                    loop
                    number={4500}
                    transition={{ duration: 0.6 }}
                    prevArrow={false}
                    nextArrow={false}
                    navigation={false}
                    className="overflow-hidden h-[120px]"
                  >
                    {c.items.map((item) => {
                      const content = item?.content || "";
                      const long = content.split(" ").length > 40;

                      return (
                        <div key={item?.id} className="h-full w-full pt-3">
                          {/* title */}
                          <p
                            className="text-[12px] font-semibold mb-1"
                            style={{ color: item?.nameColor || "#111827" }}
                          >
                            {item?.name || ""}
                          </p>

                          {/* text */}
                          <p className="text-gray-800 text-[12px] leading-5">
                            {truncate(content, 40)}{" "}
                            {long && (
                              <button
                                type="button"
                                className="text-blue-700 underline underline-offset-2 text-[12px] hover:text-blue-900"
                                onClick={() => setReadMoreItem(item)}
                              >
                                Read more
                              </button>
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </Carousel>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Modal */}
      {readMoreItem ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setReadMoreItem(null)}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

          <div
            className="
              relative w-full max-w-xl
              rounded-2xl bg-white
              shadow-[0_20px_60px_rgba(0,0,0,0.35)]
              border border-gray-200 overflow-hidden
            "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-200">
              <div className="min-w-0">
                <p
                  className="text-[14px] font-semibold truncate"
                  style={{ color: readMoreItem?.nameColor || "#111827" }}
                >
                  {readMoreItem?.name || ""}
                </p>
                <p className="text-[11px] text-gray-600">Details</p>
              </div>

              <button
                type="button"
                className="h-9 w-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
                onClick={() => setReadMoreItem(null)}
                aria-label="Close"
              >
                <ClearIcon fontSize="small" />
              </button>
            </div>

            <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
              <p className="text-gray-900 text-[12px] leading-5 whitespace-pre-wrap">
                {readMoreItem?.content || ""}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default NewsSlider;
