
<?php


    $inData = getRequestInfo();
	
		$firstname = $inData["firstname"];
    $lastname = $inData["lastname"];
    $phone = $inData["phone"];
    $email = $inData["email"];
    $userID = $inData["userID"];
		$contactID =$inData["contactID"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		//$stmt = $conn->prepare("DELETE FROM Contacts WHERE FirstName = ? AND LastName = ? AND Phone = ? AND Email = ? AND UserID = ?");
		$stmt = $conn->prepare("DELETE FROM Contacts WHERE ID = ? AND UserID = ?");
		$stmt->bind_param("ii", $contactID, $userID);
		//$stmt->bind_param("ssssi", $firstname, $lastname, $phone, $email, $userID);
	

        if($stmt->execute())
        {
            if($stmt->affected_rows > 0)
            {

                returnWithInfo("Successful deletion from contacts");

            }else
            {
                returnWithError("No contact to delete with information given. Please check any spelling errors.");
            }
        }
        else
        {
            returnWithError("Error in deleting contact." . $stmt->error);
        }


		$stmt->close();
		$conn->close();
	}

	
	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $info )
	{
		$retValue = '{"result":"' . $info .'","error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
