<?php

	$inData = getRequestInfo();
	
	$searchResults = "";
	$searchCount = 0;

	$firstname = $inData["firstname"] . "%";
  	$lastname = $inData["lastname"] . "%";
	$phone = "%" . $inData["phone"] . "%";
	$email = "%" . $inData["email"] . "%"; 
	$userID = $inData["userID"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("SELECT * FROM Contacts WHERE (FirstName like ? OR LastName like ? OR Phone like ? OR Email like ?) AND UserID like ?");
	
		$stmt->bind_param("ssssi", $firstname, $lastname, $phone, $email, $userID);
		$stmt->execute();
		
		$result = $stmt->get_result();
		
		while($row = $result->fetch_assoc())
		{
			if( $searchCount > 0 )
			{
				$searchResults .= ",";
			}
			$searchCount++;

			$searchResults .= '{"ID" : "'. $row["ID"].'", "FirstName" : "'. $row["FirstName"].'", "LastName" : "'. $row["LastName"].'", "Phone" : "'. $row["Phone"].'", "Email" : "'. $row["Email"].'", "UserID" : "'. $row["UserID"].'"}';


		
     // $searchResults .= '{"LastName" : "'. $row["LastName"].'", "Phone" : "'. $row["Phone"].'", "Email" : "'. $row["Email"].'" ,  "UserID" : "'. $row["UserID"].'"}';
		}
	
		if( $searchCount == 0 )
		{
			returnWithError( "No Records Found" );
		}
		else
		{
			returnWithInfo( $searchResults );
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
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $searchResults )
	{
		$retValue = '{"results":[' . $searchResults . '],"error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>