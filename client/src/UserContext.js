import React from "react";

const UserContext = React.createContext(undefined);

export const UserProvider = UserContext.Provider;

export const useUser = () =>
    React.useContext(UserContext);

const COL_USERS = "users";

export function useUserInfo() {
    const [info, setInfo] = React.useState(null);
    const user = useUser();
    React.useEffect(
        () => {
            const ref = firebase.firestore()
                .collection(COL_USERS)
                .doc(user.uid);
            return ref.onSnapshot(snap => {
                if (!snap.exists) {
                    ref.set({});
                    return;
                }
                setInfo(snap.data())
            });
        },
        [user.uid],
    );
    return [
        info,
        data => {
            if (typeof data === "function") {
                data = data(info);
            }
            return firebase.firestore()
                .collection(COL_USERS)
                .doc(user.uid)
                .update(data);
        },
    ];
}
