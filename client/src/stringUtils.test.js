import { getId } from "./stringUtils";

describe("getId", () => {
    test("single word", () =>
        expect(getId("cheese")).toBe("Cheese"));
    test("lowercasing", () =>
        expect(getId("CHEESE")).toBe("Cheese"));
    test("two words", () =>
        expect(getId("cheese sauce")).toBe("CheeseSauce"));
    test("singular possessive", () =>
        expect(getId("my dog's toy")).toBe("MyDogsToy"));
    test("plural possessive", () =>
        expect(getId("the dogs' toys")).toBe("TheDogsToys"));
    describe("contractions", () => {
        test("not", () =>
            expect(getId("i can't fly")).toBe("ICantFly"));
        test("are", () =>
            expect(getId("you're flying")).toBe("YoureFlying"));
        test("will", () =>
            expect(getId("i'll fly")).toBe("IllFly"));
        test("have", () =>
            expect(getId("i'll fly")).toBe("IllFly"));
        test("would", () =>
            expect(getId("he'd fly")).toBe("HedFly"));
    });
    test("non-contraction apostrophe", () =>
        expect(getId("John o'Malley")).toBe("JohnOMalley"));
});
