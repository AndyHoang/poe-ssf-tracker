/**
 * API Route for PoE data
 * Client-side components use this to fetch data
 */

import { NextRequest, NextResponse } from "next/server";
import {
  fetchDashboardData,
  fetchCharacterData,
  fetchStashData,
  fetchStashTabContents,
} from "@/services/poe";

export async function GET(request: NextRequest) {
  const sessionId = process.env.POE_SESSION_ID;

  if (!sessionId) {
    return NextResponse.json(
      { error: "POE_SESSION_ID not configured" },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "dashboard": {
        const data = await fetchDashboardData(sessionId);
        return NextResponse.json(data);
      }

      case "character": {
        const name = searchParams.get("name");
        if (!name) {
          return NextResponse.json(
            { error: "Missing character name" },
            { status: 400 }
          );
        }
        const data = await fetchCharacterData(sessionId, name);
        return NextResponse.json(data);
      }

      case "stash": {
        const league = searchParams.get("league");
        if (!league) {
          return NextResponse.json(
            { error: "Missing league" },
            { status: 400 }
          );
        }
        const data = await fetchStashData(sessionId, league);
        return NextResponse.json(data);
      }

      case "stash-tab": {
        const league = searchParams.get("league");
        const tabIndex = searchParams.get("tabIndex");
        if (!league || tabIndex === null) {
          return NextResponse.json(
            { error: "Missing league or tabIndex" },
            { status: 400 }
          );
        }
        const data = await fetchStashTabContents(
          sessionId,
          league,
          parseInt(tabIndex, 10)
        );
        return NextResponse.json(data);
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("PoE API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
