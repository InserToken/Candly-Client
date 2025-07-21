export async function fetchMyPagePractice() {
  const token = sessionStorage.getItem("token"); // <-- localStorage 말고 sessionStorage

  const res = await fetch("/api/myPage/practice", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data;
}
