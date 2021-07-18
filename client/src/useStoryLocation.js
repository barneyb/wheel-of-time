import { useUserInfo } from "./UserContext";

const STARTING_LOCATION = {
    book: "TheEyeOfTheWorld",
    chapter: "EarlierRavens",
    _order: 100,
};

function useStoryLocation() {
    const [info, setInfo] = useUserInfo();
    const storyLoc = info?.storyLocation || STARTING_LOCATION;

    const setLocation = loc => {
        if (typeof loc === "function") {
            loc = loc(storyLoc);
        }
        setInfo({storyLocation: loc});
    };

    return [
        storyLoc,
        setLocation,
    ];
}

export default useStoryLocation;
