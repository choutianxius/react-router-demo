import localforage from "localforage";
import { matchSorter } from "match-sorter";

function set(contacts) {
  return localforage.setItem("contacts", contacts);
}

class Contact {
  constructor(
    first="First",
    last="Last",
    avatar="",
    twitter="",
    notes="Some notes",
    favorite=false
  ) {
    this.first = first;
    this.last = last;
    this.avatar = avatar;
    this.twitter = twitter;
    this.notes = notes;
    this.favorite = favorite;
    this.id = Math.random().toString(36).substring(2, 9);
    this.createdAt = Date.now();
  }
}

// set default contacts
set([
  new Contact("Your", "Name", "https://placekitten.com/g/200/200", "your_handle", "Some notes", true),
  new Contact("Your", "Friend", "https://placekitten.com/g/200/200", "friend_handle", "Other notes", false),
]);

// fake a cache so we don't slow down stuff we've already seen
let fakeCache = {};

async function fakeNetwork(key) {
  if (!key) {
    return;
  }

  if (fakeCache[key]) {
    return;
  }

  fakeCache[key] = true;
  return new Promise(res => {
    setTimeout(res, Math.random() * 800);
  });
}

function sortBy(a, b) {
  if (a["createdAt"] < b["createdAt"]) return -1;
  else if(a["createdAt"] === b["createdAt"]) return 0;
  else return 1;
}

export async function getContacts(query) {
  await fakeNetwork(`getContacts:${query}`);
  let contacts = await localforage.getItem("contacts");
  if (!contacts) contacts = [];
  if (query) {
    contacts = matchSorter(contacts, query, { keys: ["first", "last"] });
  }
  return contacts.sort(sortBy);
}

export async function createContact() {
  await fakeNetwork();
  let contact = new Contact();
  let contacts = await getContacts();
  contacts.unshift(contact);
  await set(contacts);
  return contact;
}

export async function getContact(id) {
  await fakeNetwork(`contact:${id}`);
  let contacts = await localforage.getItem("contacts");
  let contact = contacts.find(contact => contact.id === id);
  return contact ?? null;
}

export async function updateContact(id, updates) {
  await fakeNetwork();
  let contacts = await localforage.getItem("contacts");
  let contact = contacts.find(contact => contact.id === id);
  if (!contact) throw new Error("No contact found for", id);
  Object.assign(contact, updates);
  await set(contacts);
  return contact;
}

export async function deleteContact(id) {
  await fakeNetwork();
  let contacts = await localforage.getItem("contacts");
  let index = contacts.findIndex(contact => contact.id === id);
  if (index > -1) {
    contacts.splice(index, 1);
    await set(contacts);
    return true;
  }
  return false;
}
