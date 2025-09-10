import React, { useEffect, useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import { fetchNews } from "@/services/auth/Auth.services";
import { Carousel } from "@material-tailwind/react";

const NewsSlider = () => {
  const [news, setNews] = useState([]);
  const [readMoreItem, setReadMoreItem] = useState(null);
  const [isAnnouncementPaused, setIsAnnouncementPaused] = useState(false);
  const [isIndustryPaused, setIsIndustryPaused] = useState(false);

  const handleAnnouncementMouseEnter = () => {
    setIsAnnouncementPaused(true);
  };

  const handleAnnouncementMouseLeave = () => {
    setIsAnnouncementPaused(false);
  };

  const handleIndustryMouseEnter = () => {
    setIsIndustryPaused(true);
  };

  const handleIndustryMouseLeave = () => {
    setIsIndustryPaused(false);
  };

  useEffect(() => {
    const fetchRandomNews = async () => {
      try {
        const result = await fetchNews({ clientId: 4 });
        if (Array.isArray(result)) {
          const importantAnnouncementNews = result.filter(
            (item) => item.flag.toLowerCase() === "t" // replace "t" into "i"
          );
          const industryNews = result.filter(
            (item) => item.flag.toLowerCase() === "n"
          );
          setNews({
            importantAnnouncementNews: importantAnnouncementNews,
            industryNews: industryNews,
          });
        } else {
          console.error("Invalid data format received from API");
        }
      } catch (error) {
        console.error("API call error:", error);
      }
    };
    fetchRandomNews();
  }, []);

  function truncateContent(content, maxLength) {
    // Check if content is defined and is a string
    if (!content || typeof content !== "string") {
      return ""; // Return an empty string or a default message if content is not valid
    }
    const words = content.split(" ");
    if (words.length > maxLength) {
      return words.slice(0, maxLength).join(" ") + "...";
    } else {
      return content;
    }
  }

  function handleReadMore(item) {
    setReadMoreItem(item); // Set the item to display
  }

  return (
    <div
      className={`flex  w-[100%] justify-center space-x-5 absolute mt-auto top-[60%] px-12 pb-12`}
    >
      <div
        className={`mb-10 w-[50%] hideScrollbar overflow-y-auto bg-white w-full mt-2 screen-md:w-772px screen-lg:w-9/12  h-[150px] screen-sm:h-[110px] screen-md:h-[160px] pt-4 pb-4 p-8 rounded-lg shadow-md border border-gray-300 `}
      >
        <p className="text-black font-bold text-[14px] mb-2">
          Important Announcement
        </p>
        <div className="h-[100px] screen-sm:h-[60px] screen-md:h-[110px] hideScrollbar overflow-y-auto ">
          {news?.importantAnnouncementNews?.length === 0 ? (
            <div>No Data</div>
          ) : (
            <div
              onMouseEnter={handleAnnouncementMouseEnter}
              onMouseLeave={handleAnnouncementMouseLeave}
            >
              <Carousel
                autoplay={!isAnnouncementPaused}
                loop={true}
                number={4000}
                transition={{ duration: 0.5 }}
                prevArrow={false}
                nextArrow={false}
                navigation={false}
                className="overflow-hidden h-full w-full"
              >
                {news?.importantAnnouncementNews?.map((item) => (
                  <div key={item.id} className="w-[100%]">
                    <p
                      className="text-[12px] font-bold mb-1 mt-1"
                      style={{ color: item.nameColor }}
                    >
                      {item.name}
                    </p>
                    <div>
                      <p className="text-black text-[12px]">
                        {truncateContent(item.content, 50)}
                        {item.content.length > 50 && (
                          <span
                            className="text-blue-900 underline text-[12px] cursor-pointer"
                            onClick={() => handleReadMore(item)}
                          >
                            Read More
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          )}
        </div>
      </div>

      <div
        className={`bg-white w-[50%] hideScrollbar overflow-y-auto w-full mt-2 screen-md:w-772px screen-lg:w-9/12  h-[150px] screen-sm:h-[110px] screen-md:h-[160px] pt-4 pb-4 p-8 rounded-lg shadow-md border border-gray-300 `}
      >
        <p className="text-black font-bold text-[14px] mb-2">Industry News</p>
        <div className="h-[100px] screen-sm:h-[60px] screen-md:h-[110px] hideScrollbar overflow-y-auto ">
          {news?.industryNews?.length === 0 ? (
            <div>No Data</div>
          ) : (
            <div
              onMouseEnter={handleIndustryMouseEnter}
              onMouseLeave={handleIndustryMouseLeave}
            >
              <Carousel
                autoplay={!isIndustryPaused}
                loop={true}
                number={4000}
                transition={{ duration: 0.5 }}
                prevArrow={false}
                nextArrow={false}
                navigation={false}
                className="overflow-hidden h-full w-full"
              >
                {news?.industryNews?.map((item) => (
                  <div key={item.id} className="w-[100%]">
                    <p
                      className="text-[12px] font-bold mb-1 mt-1"
                      style={{ color: item.nameColor }}
                    >
                      {item.name}
                    </p>
                    <div>
                      <p className="text-black text-[12px]">
                        {truncateContent(item.content, 50)}
                        {item.content.length > 50 && (
                          <span
                            className="text-blue-900 underline text-[12px] cursor-pointer"
                            onClick={() => handleReadMore(item)}
                          >
                            Read More
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          )}
        </div>
      </div>

      {readMoreItem ? (
        <pre
          className="relative z-10"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => setReadMoreItem(null)}
          >
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full  items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div
                  className="  relative h-[500px] flex hideScrollbar overflow-y-auto transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl whitespace-pre-wrap custom-width-for-small-screens "
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <div className="flex justify-between items-start">
                          <h3
                            className="text-base font-semibold leading-6 pb-1"
                            style={{ color: readMoreItem.nameColor }}
                            id="modal-title"
                          >
                            {readMoreItem.name}
                          </h3>
                        </div>
                        <div className="mt-2">
                          <p className="text-black text-[12px]">
                            {readMoreItem.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="cursor-pointer mr-2 mt-2 "
                    onClick={() => setReadMoreItem(null)}
                  >
                    <ClearIcon />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </pre>
      ) : null}
    </div>
  );
};

export default NewsSlider;
