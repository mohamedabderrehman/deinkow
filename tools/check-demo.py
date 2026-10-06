"""HTTP checks against a fresh synthetic demo. Python standard library only."""
import os,json,urllib.request,urllib.error,uuid
base=os.environ.get('DEMO_API_URL','http://127.0.0.1:8086')
def call(path,method='GET',body=None,token=None,content='application/json'):
 headers={'Content-Type':content}
 if token:headers['Authorization']='Bearer '+token
 req=urllib.request.Request(base+path,data=body if isinstance(body,bytes) else json.dumps(body).encode() if body else None,headers=headers,method=method)
 try:r=urllib.request.urlopen(req)
 except urllib.error.HTTPError as e:r=e
 raw=r.read()
 try:data=json.loads(raw)
 except ValueError:data=raw
 return r.status,data
def login(name):
 code,data=call('/api/auth/login.php','POST',{'emailOrUsername':name,'password':os.environ['DEMO_PASSWORD']})
 assert code==200 and data['success'],(code,data)
 return data['data']['token']
client=login('client');other=login('other');admin=login('admin')
code,data=call('/api/support/tickets.php','POST',{'subject':'Synthetic acceptance '+uuid.uuid4().hex,'message':'Generated demo request'},client)
assert code==200 and data['success'],(code,data)
ticket=data['data']['ticketId']
assert call('/api/support/ticket-detail.php?id='+str(ticket),token=other)[0]==403
assert call('/api/chat/index.php?ticket_id='+str(ticket),token=other)[0]==403
assert call('/api/chat/index.php','POST',{'ticket_id':ticket,'message':'Generated message'},client)[0]==201
boundary=uuid.uuid4().hex
body=(f'--{boundary}\r\nContent-Disposition: form-data; name="ticket_id"\r\n\r\n{ticket}\r\n--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="synthetic.txt"\r\nContent-Type: text/plain\r\n\r\nGenerated public demo attachment\r\n--{boundary}--\r\n').encode()
code,data=call('/api/files/index.php','POST',body,client,'multipart/form-data; boundary='+boundary)
assert code==201 and data['success'],(code,data)
file=data['data'];file_id=file['file_id']
assert call('/'+file['file_path'])[0]==403
assert call('/api/files/download.php?id='+str(file_id),token=other)[0]==403
assert call('/api/files/download.php?id='+str(file_id),token=client)[0]==200
assert call('/api/files/download.php?id='+str(file_id),token=admin)[0]==200
assert call('/workroom')[0]==200
assert call('/database.sql')[0]==403
print('PASS: client/admin authentication, request creation, chat, ticket isolation, upload and authenticated attachment access, direct route and schema protection.')
