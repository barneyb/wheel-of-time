import useLocalStorage from "./useLocalStorage";

const STARTING_LOCATION = {
    book: "TheEyeOfTheWorld",
    chapter: "EarlierRavens",
    _order: 100,
};

function useStoryLocation() {
    return useLocalStorage(
        "story-location",
        STARTING_LOCATION,
    );
}

export default useStoryLocation;
