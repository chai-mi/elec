const roomIdSelect = document.getElementById("room_id")! as HTMLFormElement;

const pastdaysSelect = document.getElementById(
    "pastdays",
)! as HTMLSelectElement;

const subscript = document.getElementById("subscription")!;

const chart = document.getElementById("chart")! as HTMLCanvasElement;

export { chart, pastdaysSelect, roomIdSelect, subscript };
