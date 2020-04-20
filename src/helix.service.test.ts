import { HelixService } from "./helix.service";
import * as api from "./helix.api";

const newMockData = (viewCount: number) => (
{
    "id": "26007494656",
    "user_id": "23161357",
    "user_name": "LIRIK",
    "game_id": "417752",
    "type": "live",
    "title": "Hey Guys, It's Monday - Twitter: @Lirik",
    "viewer_count": viewCount,
    "started_at": "2017-08-14T16:08:32Z",
    "language": "en",
    "thumbnail_url": "https://static-cdn.jtvnw.net/previews-ttv/live_user_lirik-{width}x{height}.jpg"
    }
)

describe("Helix services", () => {
    describe("fetchHelixData", () => {
        describe("When there is muliple streamers then", () => {

            let result: any;

            beforeAll( async () => {
                jest.resetAllMocks();
                const service = new HelixService();
                jest.spyOn(api,"fetchingHelix").mockResolvedValueOnce([100,200,300].map(newMockData));
                result = await service.fetchHelixData("fakeGameId");
            })

            test("Sum of number of viewers" , async () => {
                expect(result.viewCounts).toStrictEqual(600);
            });

            test("Sum of number of streamers" , async () => {
                expect(result.steamerCount).toStrictEqual(3);
            });
            
        });
    })
});