import "./list.css";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import SearchItem from "../../components/searchItem/SearchItem";
import useFetch from "../../hooks/useFetch";

const List = () => {
  const location = useLocation();
  const { destination, dates, options } = location.state || {
    destination: "",
    dates: [{ startDate: new Date(), endDate: new Date() }],
    options: { adult: 1, children: 0, room: 1 },
  };

  const [searchDestination, setSearchDestination] = useState(destination);
  const [searchDates, setSearchDates] = useState(dates);
  const [openDate, setOpenDate] = useState(false);
  const [searchOptions, setSearchOptions] = useState(options);
  const [min, setMin] = useState(undefined);
  const [max, setMax] = useState(undefined);

  const { data, loading, error, reFetch } = useFetch(
    `http://localhost:8800/api/hotels?city=${searchDestination}&min=${
      min || 0
    }&max=${max || 999}`
  );

  const handleClick = () => {
    reFetch();
  };

  useEffect(() => {
    setSearchDestination(destination);
    setSearchDates(dates);
    setSearchOptions(options);
  }, [destination, dates, options]);

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="listContainer">
        <div className="listWrapper">
          <div className="listSearch">
            <h1 className="lsTitle">Search</h1>
            <div className="lsItem">
              <label>Destination</label>
              <input
                placeholder={searchDestination || "Enter your destination"}
                type="text"
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
              />
            </div>
            <div className="lsItem">
              <label>Check-in Date</label>
              <span onClick={() => setOpenDate(!openDate)}>{`${format(
                searchDates[0].startDate,
                "MM/dd/yyyy"
              )} to ${format(searchDates[0].endDate, "MM/dd/yyyy")}`}</span>
              {openDate && (
                <DateRange
                  onChange={(item) => setSearchDates([item.selection])}
                  minDate={new Date()}
                  ranges={searchDates}
                />
              )}
            </div>
            <div className="lsItem">
              <label>Options</label>
              <div className="lsOptions">
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Min price <small>per night</small>
                  </span>
                  <input
                    type="number"
                    onChange={(e) => setMin(e.target.value)}
                    className="lsOptionInput"
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Max price <small>per night</small>
                  </span>
                  <input
                    type="number"
                    onChange={(e) => setMax(e.target.value)}
                    className="lsOptionInput"
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Adult</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    placeholder={searchOptions.adult}
                    value={searchOptions.adult}
                    onChange={(e) =>
                      setSearchOptions({
                        ...searchOptions,
                        adult: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Children</span>
                  <input
                    type="number"
                    min={0}
                    className="lsOptionInput"
                    placeholder={searchOptions.children}
                    value={searchOptions.children}
                    onChange={(e) =>
                      setSearchOptions({
                        ...searchOptions,
                        children: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Room</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    placeholder={searchOptions.room}
                    value={searchOptions.room}
                    onChange={(e) =>
                      setSearchOptions({
                        ...searchOptions,
                        room: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <button onClick={handleClick}>Search</button>
          </div>
          <div className="listResult">
            {loading ? (
              "loading"
            ) : (
              <>
                {data.map((item) => (
                  <SearchItem item={item} key={item._id} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;
